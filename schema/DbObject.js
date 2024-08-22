import { TableEventTypes } from "../interface/definitions.js"
import { sqlDelete, sqlFirst, sqlInsert, sqlUpdate } from "../util/sql.js"

export default class DbObject {
    constructor(name) {
        this.name = name
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
    constructor(name, validation) {
        super(name)
        this.validation = validation
    }
}

export class DbTable extends DbObject {
    // #events = TableEventTypes.values().reduce((acc, cur) => acc[cur] = []; return acc, {})
    // #events = Object.fromEntries(TableEventTypes.values().map(e => [e, new EventTarget()]))
    #events = new EventTarget()

    on(eventType, listener) {
        this.#events.addEventListener(eventType, ({ detail }) => listener(detail))
    }

    emit(eventType, detail, transaction) {
        if (transaction) {
            transaction.onCommit(e => this.emit(eventType, detail))
            return
        }

        this.#events.dispatchEvent(new CustomEvent(eventType, { detail }))
        this.#events.dispatchEvent(new CustomEvent(TableEventTypes.Change, { eventType, detail }))
    }

    emitInsert = id => this.emit(TableEventTypes.Insert, id)
    emitDelete = id => this.emit(TableEventTypes.Delete, id)
    emitUpdate = (id, obj) => this.emit(TableEventTypes.Update, { id, obj })
    onInsert = listener => this.on(TableEventTypes.Insert, listener)
    onDelete = listener => this.on(TableEventTypes.Delete, listener)
    onUpdate = listener => this.on(TableEventTypes.Update, listener)
    onChange = listener => this.on(TableEventTypes.Change, listener)

    async add(obj, transaction) {
        const id = await sqlInsert(this, obj, transaction)
        this.emitInsert(id)
        return id
    }

    async getId(id) {
        if (id === undefined)
            return undefined

        return sqlFirst`SELECT * FROM ${this} WHERE ${this.id} = ${id}`
    }

    async deleteId({ id }, transaction) {
        await sqlDelete(this, transaction)`WHERE ${this.id} = ${id}`
        this.emitDelete(id)
    }

    // todo this should either allow for listening based on column
    // or provide oldObj and newObj (but the former is better because no calls, the latter would be more comprehensive because it would involve triggers)
    // also we need to take the transaction into consideration (add commited event listener to transaction object)
    async updateId({ id }, obj, transaction) {
        await sqlUpdate(this, obj, transaction)`WHERE ${this.id} = ${id}`
        this.emitUpdate(id, obj)
    }

    async updateColumnId({ id }, dbColumn, value, transaction) {
        await this.updateId({ id }, { [dbColumn.name]: value }, transaction)
    }

    getColumns(...except) {
        return Object.values(this).filter(v => v instanceof DbColumn && !except.includes(v))
    }
}

export class DbFunction extends DbObject {
    constructor(name, ...values) {
        super(name)
        this.values = values
    }
}