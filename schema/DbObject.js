import { EventEmitter } from "events"
import { TableEventTypes } from "../interface/definitions.js"
import { sqlDelete, sqlFirst, sqlInsert, sqlUpdate } from "../util/sql.js"

export default class DbObject {
    constructor(dbName) {
        this.dbName = dbName
    }

    // not sure how to do this yet
    as(alias) {
        this.alias = alias
        return this
    }

    getAlias() {
        return this.alias ? ` AS ` + this.alias : ''
    }
}

export class DbColumn extends DbObject {
    constructor(dbName, { computed, validation } = {}) {
        super(dbName)
        this.options = { computed, validation }
    }

    static id = new DbColumn('id')
}

export class DbTable extends DbObject {
    #events = new EventEmitter()

    constructor(name) {
        super(name)
        this.#events.setMaxListeners(50)
    }

    emit(tableEventType, detail) {
        // if (transaction) {
        //     transaction.onCommit(_ => this.emit(tableEventType, detail))
        //     return
        // }

        this.#events.emit(tableEventType, detail)
        this.#events.emit(TableEventTypes.Change, { tableEventType, ...detail })
    }

    emitInsert = inserted => this.#events.emit(TableEventTypes.Insert, { inserted })
    emitDelete = deleted => this.#events.emit(TableEventTypes.Delete, { deleted })
    emitUpdate = (deleted, inserted) => this.#events.emit(TableEventTypes.Update, { deleted, inserted })
    on = this.#events.on
    once = this.#events.once

    async add(obj, transaction) {
        const inserted = await sqlInsert(this, obj, transaction)
        this.emitInsert(inserted)

        return inserted
    }

    async getId(id) {
        if (id === undefined)
            return undefined

        return sqlFirst(this)`WHERE ${this.id} = ${id}`
    }

    // database events are only emitted in this class
    // but it could instead be sqlDelete(dbTable) -> dbTable.emit(deletedArray)
    async deleteId({ id }, transaction) {
        const deleted = (await sqlDelete(this, transaction)`WHERE ${this.id} = ${id}`)[0]
        deleted && this.emitDelete(deleted)
        return deleted
    }

    async updateId({ id }, updates, transaction) {
        const deleted = (await sqlUpdate(this, updates, transaction)`WHERE ${this.id} = ${id}`)[0]
        deleted && this.emitUpdate(deleted, updates)
        return deleted
    }

    async updateColumnId({ id }, dbColumn, value, transaction) {
        await this.updateId({ id }, { [dbColumn.dbName]: value }, transaction)
    }

    getColumns(...except) {
        return Object.values(this).filter(v => v instanceof DbColumn && !except.includes(v))
    }

    getAbbreviatedColumns() {
        return this.getColumns()
    }

    static temporary = () => '#temp' + Math.floor(Math.random() * 100000)
}

export class DbFunction extends DbObject {
    constructor(dbName, ...values) {
        super(dbName)
        this.values = values
    }
}