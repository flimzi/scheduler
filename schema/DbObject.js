import { sqlCast, sqlDelete, sqlFirst, sqlInsert, sqlUpdate } from "../util/sql.js"

export default class DbObject {
    constructor(name) {
        this.name = name
    }
}

export class Table extends DbObject { }
export class Column extends DbObject { }

export class IdTable extends Table {
    id = new Column('id')

    async get(id) {
        if (id === undefined)
            return undefined

        return sqlFirst`SELECT * FROM ${this} WHERE ${this.id} = ${id}`
    }

    add(obj, transaction) {
        return sqlInsert(this, obj, transaction)
    }

    delete({ id }, transaction) {
        return sqlDelete(this, transaction)`WHERE ${this.id} = ${id}`
    }

    update(obj, transaction) {
        return sqlUpdate(this, obj, transaction)`WHERE ${this.id} = ${obj.id}`
    }
}

export class IdModelTable extends IdTable {
    constructor(name, getModelType) {
        super(name)
        this.getModelType = getModelType
    }

    sqlModel(strings, ...values) {
        return sqlCast(this.getModelType().conversion)(strings, ...values)
    }

    async get(id) {
        if (id === undefined)
            return undefined

        return this.sqlModel`SELECT * FROM ${this} WHERE ${this.id} = ${id}`
    }
}