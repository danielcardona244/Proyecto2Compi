import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class StructLiteral extends Instruccion {
    constructor(
        public nombreStruct: string | null,
        public campos: { nombre: string; valor: Instruccion }[],
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.STRUCT, false, undefined, nombreStruct || undefined), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const obj: any = { __structName: this.nombreStruct || "struct" };
        for (const campo of this.campos) {
            obj[campo.nombre] = campo.valor.interpretar(arbol, tabla);
        }
        return obj;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node(this.nombreStruct ? `STRUCT_LITERAL ${this.nombreStruct}` : "STRUCT_LITERAL");
        for (const campo of this.campos) {
            const field = new Node(campo.nombre);
            field.pushChild(campo.valor.ast(arbol, tabla));
            node.pushChild(field);
        }
        return node;
    }
}
