import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";
import { AccesoArreglo } from "../Expresiones/AccesoArreglo";
import { AccesoCampo } from "../Expresiones/AccesoCampo";

export class Asignacion extends Instruccion {
    public id: string | Instruccion;
    public valor: Instruccion;
    public operador: string; // '=', '+=', '-=', etc.

    constructor(id: string | Instruccion, valor: Instruccion, linea: number, columna: number, operador: string = '=') {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.id = id;
        this.valor = valor;
        this.operador = operador;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorInterpretado = this.valor.interpretar(arbol, tabla);
        if (valorInterpretado instanceof Errores) {
            return valorInterpretado;
        }

        if (this.id instanceof AccesoArreglo || this.id instanceof AccesoCampo) {
            return this.asignarAcceso(arbol, tabla, valorInterpretado);
        }

        if (typeof this.id !== "string") {
            arbol.errores.push(new Errores("SEMANTICO", "Destino de asignacion invalido", this.linea, this.columna));
            return null;
        }

        let simbolo = tabla.getSimbolo(this.id);
        if (simbolo === null) {
            arbol.errores.push(new Errores("SEMANTICO", `Variable ${this.id} no definida`, this.linea, this.columna));
            return null;
        }

        let nuevoValor = valorInterpretado;
        if (this.operador !== '=') {
            switch (this.operador) {
                case '+=':
                    nuevoValor = simbolo.valor + valorInterpretado;
                    break;
                case '-=':
                    nuevoValor = simbolo.valor - valorInterpretado;
                    break;
                case '*=':
                    nuevoValor = simbolo.valor * valorInterpretado;
                    break;
                case '/=':
                    nuevoValor = simbolo.valor / valorInterpretado;
                    break;
                case '%=':
                    nuevoValor = simbolo.valor % valorInterpretado;
                    break;
            }
        }

        simbolo.valor = nuevoValor;
        tabla.actualizarSimbolo(simbolo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("ASIGNACION");
        node.pushChild(typeof this.id === "string" ? new Node(this.id) : this.id.ast(arbol, tabla));
        node.pushChild(new Node("="));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }

    private asignarAcceso(arbol: Arbol, tabla: TablaSimbolos, valorInterpretado: any): any {
        if (this.id instanceof AccesoArreglo) {
            const arreglo = this.id.arreglo.interpretar(arbol, tabla);
            const indice = this.id.indice.interpretar(arbol, tabla);
            if (Array.isArray(arreglo) && Number.isInteger(indice)) {
                arreglo[indice] = valorInterpretado;
                return null;
            }
        }

        if (this.id instanceof AccesoCampo) {
            const objeto = this.id.objeto.interpretar(arbol, tabla);
            if (objeto && typeof objeto === "object") {
                objeto[this.id.campo] = valorInterpretado;
                return null;
            }
        }

        arbol.errores.push(new Errores("SEMANTICO", "Destino de asignacion invalido", this.linea, this.columna));
        return null;
    }
}
