import { Simbolo } from "./Simbolo";

export class TablaSimbolos {
    public simbolos: Map<string, Simbolo>;
    public funciones: Map<string, any>;
    public structs: Map<string, any>;
    public padre: TablaSimbolos | null;
    public nombre: string;

    constructor(padre: TablaSimbolos | null = null, nombre: string = padre ? "Local" : "Global") {
        this.simbolos = new Map();
        this.funciones = new Map();
        this.structs = new Map();
        this.padre = padre;
        this.nombre = nombre;
    }

    public setSimbolo(simbolo: Simbolo): boolean {
        if (this.simbolos.has(simbolo.id)) {
            return false; // Ya existe
        }
        this.simbolos.set(simbolo.id, simbolo);
        return true;
    }

    public getSimbolo(id: string): Simbolo | null {
        let tabla: TablaSimbolos | null = this;
        while (tabla !== null) {
            if (tabla.simbolos.has(id)) {
                return tabla.simbolos.get(id)!;
            }
            tabla = tabla.padre;
        }
        return null;
    }

    public actualizarSimbolo(simbolo: Simbolo): boolean {
        let tabla: TablaSimbolos | null = this;
        while (tabla !== null) {
            if (tabla.simbolos.has(simbolo.id)) {
                tabla.simbolos.set(simbolo.id, simbolo);
                return true;
            }
            tabla = tabla.padre;
        }
        return false;
    }

    public setFuncion(nombre: string, funcion: any): void {
        this.funciones.set(nombre, funcion);
    }

    public getFuncion(nombre: string): any {
        let tabla: TablaSimbolos | null = this;
        while (tabla !== null) {
            if (tabla.funciones.has(nombre)) {
                return tabla.funciones.get(nombre)!;
            }
            tabla = tabla.padre;
        }
        return null;
    }

    public setStruct(nombre: string, struct: any): void {
        this.structs.set(nombre, struct);
    }

    public getStruct(nombre: string): any {
        let tabla: TablaSimbolos | null = this;
        while (tabla !== null) {
            if (tabla.structs.has(nombre)) {
                return tabla.structs.get(nombre)!;
            }
            tabla = tabla.padre;
        }
        return null;
    }
}
