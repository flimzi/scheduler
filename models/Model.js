import { sqlFirst } from "../util/sql.js"

export default class Model {
    constructor(init) {
        Object.deleteUndefinedProperties(init)
        Object.assign(this, init)
    }

    static cast(init, type) {
        if (init === undefined)
            return undefined

        return new type(init)
    }

    static convert(init, getType) {
        return this.cast(init, getType(init))
    }

    static getType(init) {
        return this
    }

    getTable() { }

    static from(init) {
        return this.convert(init, this.getType.bind(this))
    }

    to(type) {
        return this.cast(this, type)
    }

    clone() {
        return new this.constructor(this)
    }

    autoCast() {
        return this.from(this)
    }

    async getUpdateModel() {
        return this.clone(this)
    }

    async add(transaction) {
        return this.getTable()?.add(await this.getUpdateModel(), transaction)
        
        // return this.getTable()?.add(await this.getUpdateModel(), transaction).convert(this.getType)
    }

    async delete(transaction) {
        return this.getTable()?.delete(this, transaction)
    }

    async update(updates, transaction) {
        return this.getTable?.updateId(this, updates, transaction)
    }

    async updateColumn(dbColumn, value, transaction) {
        return this.getTable?.updateColumnId(this, dbColumn, value, transaction)
    }

    async download() {
        return this.getTable?.getId(this.id)
    }

    async upload() {
        return this.update(this.getUpdateModel())
    }
}

Object.defineProperty(Object.prototype, Model.cast.name, {
    value: function(type) {
        return Model.cast(this, type)
    },
    enumerable: false,
    configurable: true,
    writable: true,
})  

Promise.prototype.cast = async function(type) {
    return this.then(result => Model.cast(result, type))
}

Promise.prototype.convert = async function(type) {
    return this.then(result => Model.convert(result, type))
}

export const sqlCast = type => (strings, ...values) => sqlFirst(strings, ...values).cast(type)