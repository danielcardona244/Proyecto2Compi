import { tipoDato } from "./tipoDato";

export class Tipo {
    public tipoDato: tipoDato;
    public isArray: boolean;
    public subtipo?: Tipo; // Para slices y maps
    public nombreStruct?: string;

    constructor(tipoDato: tipoDato, isArray: boolean = false, subtipo?: Tipo, nombreStruct?: string) {
        this.tipoDato = tipoDato;
        this.isArray = isArray;
        this.subtipo = subtipo;
        this.nombreStruct = nombreStruct;
    }
}
