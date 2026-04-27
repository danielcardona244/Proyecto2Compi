import { Tipo } from "./Tipo";

export class Simbolo {
    public id: string;
    public tipo: Tipo;
    public valor: any;
    public linea: number;
    public columna: number;
    public tipoSimbolo: string;
    public ambito: string;

    constructor(id: string, tipo: Tipo, valor: any, linea: number, columna: number, tipoSimbolo: string = "Variable", ambito: string = "Global") {
        this.id = id;
        this.tipo = tipo;
        this.valor = valor;
        this.linea = linea;
        this.columna = columna;
        this.tipoSimbolo = tipoSimbolo;
        this.ambito = ambito;
    }
}
