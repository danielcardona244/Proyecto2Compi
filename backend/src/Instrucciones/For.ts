import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export class For extends Instruccion {
    public inicial: Instruccion | null;
    public condicion: Instruccion | null;
    public incremento: Instruccion | null;
    public sentencias: Instruccion[];
    private breakFlag: boolean = false;
    private continueFlag: boolean = false;

    constructor(
        inicial: Instruccion | null,
        condicion: Instruccion | null,
        incremento: Instruccion | null,
        sentencias: Instruccion[],
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.inicial = inicial;
        this.condicion = condicion;
        this.incremento = incremento;
        this.sentencias = sentencias;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        // Crear nuevo scope para el for
        let tablaFor = new TablaSimbolos(tabla);

        // Ejecutar inicial
        if (this.inicial !== null) {
            const resultado = this.inicial.interpretar(arbol, tablaFor);
            if (resultado instanceof Errores) return resultado;
        }

        // Loop
        while (true) {
            // Evaluar condición
            if (this.condicion !== null) {
                const cond = this.condicion.interpretar(arbol, tablaFor);
                if (cond instanceof Errores) return cond;
                if (!this.isTruthy(cond)) break;
            }

            // Ejecutar sentencias
            for (const sentencia of this.sentencias) {
                if (sentencia instanceof For && sentencia.breakFlag) {
                    sentencia.breakFlag = false;
                    break;
                }
                const resultado = sentencia.interpretar(arbol, tablaFor);
                if (resultado instanceof Errores) return resultado;
            }

            if (this.breakFlag) {
                this.breakFlag = false;
                break;
            }

            // Ejecutar incremento
            if (this.incremento !== null) {
                const resultado = this.incremento.interpretar(arbol, tablaFor);
                if (resultado instanceof Errores) return resultado;
            }
        }

        return null;
    }

    private isTruthy(valor: any): boolean {
        if (valor === null || valor === false) return false;
        if (valor === true) return true;
        if (valor === 0 || valor === "" || valor === 0.0) return false;
        return true;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("FOR");
        if (this.inicial !== null) {
            node.pushChild(this.inicial.ast(arbol, tabla));
        }
        if (this.condicion !== null) {
            node.pushChild(this.condicion.ast(arbol, tabla));
        }
        if (this.incremento !== null) {
            node.pushChild(this.incremento.ast(arbol, tabla));
        }
        let nodoSentencias = new Node("SENTENCIAS");
        for (const sentencia of this.sentencias) {
            nodoSentencias.pushChild(sentencia.ast(arbol, tabla));
        }
        node.pushChild(nodoSentencias);
        return node;
    }
}
    public setRange(var1: string, var2: string | null, expr: Instruccion): void {
        this.isRange = true;
        this.rangeVar1 = var1;
        this.rangeVar2 = var2;
        this.rangeExpression = expr;
    }
    private interpretarRange(arbol: Arbol, tabla: TablaSimbolos): any {
        let tablaFor = new TablaSimbolos(tabla);
        const collection = this.rangeExpression!.interpretar(arbol, tabla);
        if (Array.isArray(collection)) {
            for (let i = 0; i < collection.length; i++) {
                if (this.rangeVar1) tablaFor.setVariable(this.rangeVar1, i, new Tipo(tipoDato.ENTERO, false));
                if (this.rangeVar2) tablaFor.setVariable(this.rangeVar2, collection[i], new Tipo(tipoDato.ENTERO, false)); // Placeholder type
                for (const sentencia of this.sentencias) {
                    const resultado = sentencia.interpretar(arbol, tablaFor);
                    if (resultado instanceof Errores) return resultado;
                    if (this.breakFlag) {
                        this.breakFlag = false;
                        return null;
                    }
                }
            }
        } else if (collection instanceof MapType) {
            for (const [key, value] of collection.values.entries()) {
                if (this.rangeVar1) tablaFor.setVariable(this.rangeVar1, key, new Tipo(tipoDato.ENTERO, false));
                if (this.rangeVar2) tablaFor.setVariable(this.rangeVar2, value, new Tipo(tipoDato.ENTERO, false));
                for (const sentencia of this.sentencias) {
                    const resultado = sentencia.interpretar(arbol, tablaFor);
                    if (resultado instanceof Errores) return resultado;
                    if (this.breakFlag) {
                        this.breakFlag = false;
                        return null;
                    }
                }
            }
        }
        return null;
    }
