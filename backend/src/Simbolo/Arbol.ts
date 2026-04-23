import { Instruccion } from "../Abstract/Instruccion";
import { TablaSimbolos } from "./TablaSimbolos";
import { Errores } from "../Excepciones/Errores";
import { Simbolo } from "./Simbolo";

export class Arbol {
    public instrucciones: Instruccion[];
    public consola: string = "";
    public tablaGlobal: TablaSimbolos;
    public errores: Errores[] = [];
    public simbolos: Simbolo[] = [];
    public contador: number = 0;

    constructor(instrucciones: Instruccion[]) {
        this.instrucciones = instrucciones;
        this.tablaGlobal = new TablaSimbolos();
    }

    public print(valor: string): void {
        this.consola += valor + "\n";
    }

    public getContador(): number {
        this.contador++;
        return this.contador;
    }
}