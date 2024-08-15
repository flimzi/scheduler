export default class Model {
    constructor(init) {
        Object.deleteUndefinedProperties(init)
        Object.assign(this, init)
    }

    static conversion(model) {
        if (model !== undefined)
            return this.constructor
    }

    static from(init) {
        return Object.cast(init, this.conversion)
    }

    autoCast() {
        return Model.from(this)
    }
}