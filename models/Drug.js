import dbDrugs from "../schema/Drugs.js";
import Model from "./Model.js";

export default class Drug extends Model {
    static getTable() { return dbDrugs }

    constructor({ id, userId, name, category, info, unit }) {
        super({ id, userId, name, category, info, unit })
    }
}