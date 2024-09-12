import { fakerPL as faker } from "@faker-js/faker";
import { DrugCategories, Units } from "../interface/definitions.js";
import dbDrugs from "../schema/Drugs.js";
import Model from "./Model.js";

export default class Drug extends Model {
    static getTable() { return dbDrugs }

    constructor({ id, userId, name, category, info, unit }) {
        super({ id, userId, name, category, info, unit })
    }

    static fake = userId => new Drug({
        userId,
        name: faker.commerce.productName(), 
        category: DrugCategories.random(), 
        unit: Units.random(), 
        info: faker.commerce.productDescription()
    })
}