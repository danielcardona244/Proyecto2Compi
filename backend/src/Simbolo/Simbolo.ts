import { Tipo } from "./Tipo";

export class Simbolo {
    public id: string;
    public tipo: Tipo;
    public valor: any;
    public linea: number;
    public columna: number;

    constructor(id: string, tipo: Tipo, valor: any, linea: number, columna: number) {
        this.id = id;
        this.tipo = tipo;
        this.valor = valor;
        this.linea = linea;
        this.columna = columna;
    }
}