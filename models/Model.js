
export default class Model {
    constructor(init) {
        Object.deleteUndefinedProperties(init)
        Object.assign(this, init)
    }

    static cast(init, type) {
        if (init)
            return new type(init)
    }

    static convert(init, getType) {
        if (init)
            return this.cast(init, getType(init))
    }

    static getType(init) {
        return this
    }

    static getTable() { }

    getTable() { return Object.getPrototypeOf(this).constructor.getTable() }

    static from(init) {
        return this.convert(init, this.getType.bind(this))
    }

    clone(properties = {}) {
        return new this.constructor({ ...this, ...properties })
    }

    autoCast() {
        return this.from(this)
    }

    async getInsertModel() {
        return this.clone()
    }

    async getUpdateModel() {
        return this.getInsertModel()
    }

    async add(transaction) {
        return this.getTable()?.add(await this.getUpdateModel(), transaction).cast(this.constructor)
    }

    async delete(transaction) {
        return this.getTable()?.delete(this, transaction)
    }

    async update(updates, transaction) {
        return this.getTable()?.updateId(this, await updates.cast(this.constructor).getUpdateModel(), transaction)
    }

    async updateColumn(dbColumn, value, transaction) {
        return this.getTable()?.updateColumnId(this, dbColumn, value, transaction)
    }

    async download() {
        return this.getTable()?.getId(this.id)
    }

    async upload() {
        return this.update(await this.getUpdateModel())
    }

    async getDownloadModel() {
        return this
    }

    static async getId(id) {
        const model = await this.getTable().getId(id).convert(this.getType.bind(this))
        return model?.getDownloadModel()
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