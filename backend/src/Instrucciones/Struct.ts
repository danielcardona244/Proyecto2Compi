import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class Struct extends Instruccion {
    public nombre: string;
    public campos: any[];

    constructor(nombre: string, campos: any[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.nombre = nombre;
        this.campos = campos;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        tabla.setStruct(this.nombre, this);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node('STRUCT');
        const nombreNode = new Node('NOMBRE');
        nombreNode.pushChild(new Node(this.nombre));
        node.pushChild(nombreNode);

        const camposNode = new Node('CAMPOS');
        for (const campo of this.campos) {
            const campoNode = new Node(campo.nombre);
            if (campo.tipo) {
                const tipo = campo.tipo.nombreStruct || campo.tipo.tipoDato?.toString() || 'TIPO';
                campoNode.pushChild(new Node(tipo));
            }
            camposNode.pushChild(campoNode);
        }
        node.pushChild(camposNode);
        return node;
    }
}
