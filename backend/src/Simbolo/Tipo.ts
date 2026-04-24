import { tipoDato } from "./tipoDato";

export class Tipo {
    public tipoDato: tipoDato;
    public isArray: boolean;
    public subtipo?: Tipo; // Para slices y maps

    constructor(tipoDato: tipoDato, isArray: boolean = false, subtipo?: Tipo) {
        this.tipoDato = tipoDato;
        this.isArray = isArray;
        this.subtipo = subtipo;
    }
}