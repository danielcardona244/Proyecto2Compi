import { Tipo } from "../Simbolo/Tipo";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Node } from "./Node";

export abstract class Instruccion {
    public tipo: Tipo;
    public linea: number;
    public columna: number;

    constructor(tipo: Tipo, linea: number, columna: number) {
        this.tipo = tipo;
        this.linea = linea;
        this.columna = columna;
    }

    public abstract interpretar(arbol: Arbol, tabla: TablaSimbolos): any;
    public abstract ast(arbol: Arbol, tabla: TablaSimbolos): Node;
}