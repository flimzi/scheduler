import { sqlCast, sqlDelete, sqlFirst, sqlInsert, sqlUpdate } from "../util/sql.js"

export default class DbObject {
    constructor(name) {
        this.name = name
    }
}

export class DbTable extends DbObject { }
export class DbColumn extends DbObject { }

export class DbFunction extends DbObject {
    constructor(name, ...values) {
        super(name)
        this.values = values
    }
}

export class IdTable extends DbTable {
    id = new DbColumn('id')

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

// this probably needs refactoring and a way to integrate with models better
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