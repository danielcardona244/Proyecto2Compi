import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export interface ReturnSignal {
    control: "RETURN";
    value: any;
}

export class Retorno extends Instruccion {
    constructor(private expresion: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): ReturnSignal | Errores {
        const value = this.expresion ? this.expresion.interpretar(arbol, tabla) : null;
        if (value instanceof Errores) return value;
        return { control: "RETURN", value };
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("RETURN");
        if (this.expresion) {
            node.pushChild(this.expresion.ast(arbol, tabla));
        }
        return node;
    }
}
