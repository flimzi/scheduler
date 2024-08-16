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

// export class IdModel extends Model {
//     static idSchema

//     async getUpdateModel() {
//         const model = Object.clone(this)
//         delete model.id

//         return model
//     }

//     async update(init) {
//         return this.idSchema.update(init)
//     }

//     async delete() {
//         return this.idSchema.delete(this)
//     }

//     async fetch() {
//         return this.idSchema.get(this.id)
//     }
// }