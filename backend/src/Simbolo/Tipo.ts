import { tipoDato } from "./tipoDato";

export class Tipo {
    public tipoDato: tipoDato;
    public isArray: boolean;

    constructor(tipoDato: tipoDato, isArray: boolean = false) {
        this.tipoDato = tipoDato;
        this.isArray = isArray;
    }
}