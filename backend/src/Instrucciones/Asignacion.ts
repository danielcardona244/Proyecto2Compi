import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export class Asignacion extends Instruccion {
    public id: string;
    public valor: Instruccion;
    public operador: string; // '=', '+=', '-=', etc.

    constructor(id: string, valor: Instruccion, linea: number, columna: number, operador: string = '=') {
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
        node.pushChild(new Node(this.id));
        node.pushChild(new Node("="));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}