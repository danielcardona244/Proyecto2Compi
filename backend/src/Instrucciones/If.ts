import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export class If extends Instruccion {
    public condicion: Instruccion;
    public sentencias_if: Instruccion[];
    public sentencias_else: Instruccion[] | null;

    constructor(
        condicion: Instruccion,
        sentencias_if: Instruccion[],
        sentencias_else: Instruccion[] | null,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.condicion = condicion;
        this.sentencias_if = sentencias_if;
        this.sentencias_else = sentencias_else;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const condicion = this.condicion.interpretar(arbol, tabla);
        if (condicion instanceof Errores) {
            return condicion;
        }

        if (this.isTruthy(condicion)) {
            for (const sentencia of this.sentencias_if) {
                const resultado = sentencia.interpretar(arbol, tabla);
                if (resultado instanceof Errores) return resultado;
            }
        } else if (this.sentencias_else !== null) {
            for (const sentencia of this.sentencias_else) {
                const resultado = sentencia.interpretar(arbol, tabla);
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
        let node = new Node("IF");
        node.pushChild(this.condicion.ast(arbol, tabla));
        let nodoSentencias = new Node("SENTENCIAS_IF");
        for (const sentencia of this.sentencias_if) {
            nodoSentencias.pushChild(sentencia.ast(arbol, tabla));
        }
        node.pushChild(nodoSentencias);
        
        if (this.sentencias_else !== null) {
            let nodoElse = new Node("SENTENCIAS_ELSE");
            for (const sentencia of this.sentencias_else) {
                nodoElse.pushChild(sentencia.ast(arbol, tabla));
            }
            node.pushChild(nodoElse);
        }
        
        return node;
    }
}