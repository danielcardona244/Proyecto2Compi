import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Simbolo } from "../Simbolo/Simbolo";
import { Node } from "../Abstract/Node";

export class Declaracion extends Instruccion {
    public tipoDeclarado: tipoDato;
    public id: string;
    public valor: Instruccion | null;

    constructor(tipo: tipoDato, id: string, valor: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipo, false), linea, columna);
        this.tipoDeclarado = tipo;
        this.id = id;
        this.valor = valor;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let valorInterpretado: any = this.valorPorDefecto(this.tipoDeclarado);
        if (this.valor !== null) {
            valorInterpretado = this.valor.interpretar(arbol, tabla);
            if (valorInterpretado instanceof Errores) {
                return valorInterpretado;
            }
        }

        const tipoFinal = this.tipoDeclarado === tipoDato.VOID ? this.inferirTipo(valorInterpretado) : this.tipoDeclarado;
        let simbolo = new Simbolo(this.id, new Tipo(tipoFinal, false), valorInterpretado, this.linea, this.columna, "Variable", tabla.nombre);
        if (!tabla.setSimbolo(simbolo)) {
            arbol.errores.push(new Errores("SEMANTICO", `Variable ${this.id} ya declarada`, this.linea, this.columna));
            return null;
        }
        arbol.simbolos.push(simbolo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("DECLARACION");
        node.pushChild(new Node(this.tipoDeclarado.toString()));
        node.pushChild(new Node(this.id));
        if (this.valor !== null) {
            node.pushChild(this.valor.ast(arbol, tabla));
        }
        return node;
    }

    private inferirTipo(valor: any): tipoDato {
        if (typeof valor === 'number') {
            return valor % 1 === 0 ? tipoDato.ENTERO : tipoDato.DECIMAL;
        } else if (typeof valor === 'string') {
            return tipoDato.CADENA;
        } else if (typeof valor === 'boolean') {
            return tipoDato.BOOLEANO;
        } else if (Array.isArray(valor)) {
            return tipoDato.SLICE;
        } else if (valor && typeof valor === 'object') {
            return tipoDato.STRUCT;
        }
        return tipoDato.VOID;
    }

    private valorPorDefecto(tipo: tipoDato): any {
        switch (tipo) {
            case tipoDato.ENTERO:
            case tipoDato.CARACTER:
                return 0;
            case tipoDato.DECIMAL:
                return 0.0;
            case tipoDato.CADENA:
                return "";
            case tipoDato.BOOLEANO:
                return false;
            case tipoDato.SLICE:
            case tipoDato.MAP:
            case tipoDato.STRUCT:
            case tipoDato.VOID:
            default:
                return null;
        }
    }
}
