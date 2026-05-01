import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";
import { MapType } from "../Simbolo/Map";
import { Simbolo } from "../Simbolo/Simbolo";

export class For extends Instruccion {
    public inicial: Instruccion | null;
    public condicion: Instruccion | null;
    public incremento: Instruccion | null;
    public sentencias: Instruccion[];
    private breakFlag: boolean = false;
    // Para for range
    public isRange: boolean = false;
    public rangeVar1: string | null = null;
    public rangeVar2: string | null = null;
    public rangeExpression: Instruccion | null = null;

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
        if (this.isRange) {
            return this.interpretarRange(arbol, tabla);
        }

        // Crear nuevo scope para el for
        let tablaFor = new TablaSimbolos(tabla, "For");

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
            let continuar = false;
            const tablaCuerpo = new TablaSimbolos(tablaFor, "ForBody");
            for (const sentencia of this.sentencias) {
                const resultado = sentencia.interpretar(arbol, tablaCuerpo);
                if (resultado instanceof Errores) return resultado;
                if (resultado === "BREAK") {
                    this.breakFlag = true;
                    break;
                }
                if (resultado === "CONTINUE") {
                    continuar = true;
                    break;
                }
                if (resultado !== null) return resultado;
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

            if (continuar) continue;
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
        if (this.isRange) {
            const node = new Node("FOR_RANGE");
            const indiceNode = new Node("INDICE");
            indiceNode.pushChild(new Node(this.rangeVar1 || "_"));
            node.pushChild(indiceNode);

            if (this.rangeVar2 !== null) {
                const valorNode = new Node("VALOR");
                valorNode.pushChild(new Node(this.rangeVar2));
                node.pushChild(valorNode);
            }

            const coleccionNode = new Node("COLECCION");
            if (this.rangeExpression !== null) {
                coleccionNode.pushChild(this.rangeExpression.ast(arbol, tabla));
            }
            node.pushChild(coleccionNode);

            const sentenciasNode = new Node("SENTENCIAS");
            for (const sentencia of this.sentencias) {
                sentenciasNode.pushChild(sentencia.ast(arbol, tabla));
            }
            node.pushChild(sentenciasNode);
            return node;
        }

        let node = new Node("FOR");
        if (this.inicial !== null) {
            const inicialNode = new Node("INICIAL");
            inicialNode.pushChild(this.inicial.ast(arbol, tabla));
            node.pushChild(inicialNode);
        }
        if (this.condicion !== null) {
            const condicionNode = new Node("CONDICION");
            condicionNode.pushChild(this.condicion.ast(arbol, tabla));
            node.pushChild(condicionNode);
        }
        if (this.incremento !== null) {
            const incrementoNode = new Node("INCREMENTO");
            incrementoNode.pushChild(this.incremento.ast(arbol, tabla));
            node.pushChild(incrementoNode);
        }
        let nodoSentencias = new Node("SENTENCIAS");
        for (const sentencia of this.sentencias) {
            nodoSentencias.pushChild(sentencia.ast(arbol, tabla));
        }
        node.pushChild(nodoSentencias);
        return node;
    }

    public setRange(var1: string, var2: string | null, expr: Instruccion): void {
        this.isRange = true;
        this.rangeVar1 = var1;
        this.rangeVar2 = var2;
        this.rangeExpression = expr;
    }

    private interpretarRange(arbol: Arbol, tabla: TablaSimbolos): any {
        let tablaFor = new TablaSimbolos(tabla, "ForRange");
        const collection = this.rangeExpression!.interpretar(arbol, tabla);
        if (Array.isArray(collection) || typeof collection === "string") {
            for (let i = 0; i < collection.length; i++) {
                this.setOrUpdate(arbol, tablaFor, this.rangeVar1, new Tipo(tipoDato.ENTERO, false), i);
                this.setOrUpdate(arbol, tablaFor, this.rangeVar2, new Tipo(Array.isArray(collection) ? tipoDato.ENTERO : tipoDato.CARACTER, false), collection[i]);
                const tablaCuerpo = new TablaSimbolos(tablaFor, "ForRangeBody");
                for (const sentencia of this.sentencias) {
                    const resultado = sentencia.interpretar(arbol, tablaCuerpo);
                    if (resultado instanceof Errores) return resultado;
                    if (resultado === "BREAK") return null;
                    if (resultado === "CONTINUE") break;
                    if (resultado !== null) return resultado;
                }
            }
        } else if (collection instanceof MapType) {
            for (const [key, value] of collection.values.entries()) {
                this.setOrUpdate(arbol, tablaFor, this.rangeVar1, new Tipo(tipoDato.ENTERO, false), key);
                this.setOrUpdate(arbol, tablaFor, this.rangeVar2, new Tipo(tipoDato.ENTERO, false), value);
                const tablaCuerpo = new TablaSimbolos(tablaFor, "ForRangeBody");
                for (const sentencia of this.sentencias) {
                    const resultado = sentencia.interpretar(arbol, tablaCuerpo);
                    if (resultado instanceof Errores) return resultado;
                    if (resultado === "BREAK") return null;
                    if (resultado === "CONTINUE") break;
                    if (resultado !== null) return resultado;
                }
            }
        }
        return null;
    }

    private setOrUpdate(arbol: Arbol, tabla: TablaSimbolos, id: string | null, tipo: Tipo, valor: any): void {
        if (!id) return;
        const existente = tabla.getSimbolo(id);
        if (existente) {
            existente.valor = valor;
            existente.tipo = tipo;
            tabla.actualizarSimbolo(existente);
        } else {
            const simbolo = new Simbolo(id, tipo, valor, this.linea, this.columna, "Variable", tabla.nombre);
            tabla.setSimbolo(simbolo);
            if (!arbol.simbolos.some(s => s.id === id && s.ambito === tabla.nombre && s.linea === this.linea && s.columna === this.columna)) {
                arbol.simbolos.push(simbolo);
            }
        }
    }
}
