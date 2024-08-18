import { TableEventTypes } from "../util/definitions.js"
import { sqlCast, sqlDelete, sqlFirst, sqlInsert, sqlUpdate } from "../util/sql.js"

export default class DbObject {
    constructor(name) {
        this.name = name
    }
}

export class DbColumn extends DbObject { }

export class DbTable extends DbObject {
    // #events = TableEventTypes.values().reduce((acc, cur) => acc[cur] = []; return acc, {})
    // #events = Object.fromEntries(TableEventTypes.values().map(e => [e, new EventTarget()]))
    #events = new EventTarget()

    on(eventType, listener) {
        this.#events.addEventListener(eventType, ({detail}) => listener(detail))
    }

    emit(eventType, detail) {
        this.#events.dispatchEvent(new CustomEvent(eventType, { detail }))
    }

    // emitInsert(id) {
    //     this.emit(TableEventTypes.Insert, id)
    // }

    // emitUpdate(id) {
    //     this.emit(TableEventTypes.Update, id)
    // }

    // emitDelete(id) {
    //     this.emit(TableEventTypes.Delete, id)
    // }

    // not sure about adding properties here
    emitInsert = id => this.emit(TableEventTypes.Insert, id)
    emitUpdate = id => this.emit(TableEventTypes.Update, id)
    emitDelete = id => this.emit(TableEventTypes.Delete, id)
    onInsert = listener => this.on(TableEventTypes.Insert, listener)
    onUpdate = listener => this.on(TableEventTypes.Update, listener)
    onDelete = listener => this.on(TableEventTypes.Delete, listener)

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

    async updateId(obj, transaction) {
        await sqlUpdate(this, obj, transaction)`WHERE ${this.id} = ${obj.id}`
        this.emitUpdate(id)
    }

    getColumns() {
        return Object.values(this).filter(v => v instanceof DbColumn)
    }
}

export class DbFunction extends DbObject {
    constructor(name, ...values) {
        super(name)
        this.values = values
    }
}