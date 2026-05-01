import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class SliceLiteral extends Instruccion {
    public tipoElemento: Tipo;
    public elementos: Instruccion[];

    constructor(tipoElemento: Tipo, elementos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.ENTERO, true), linea, columna); // Slice type
        this.tipoElemento = tipoElemento;
        this.elementos = elementos;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        return this.elementos.map(elem => elem.interpretar(arbol, tabla));
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('SLICE_LITERAL');
        const tipoNode = new Node('TIPO_ELEMENTO');
        tipoNode.pushChild(new Node(this.tipoElemento.nombreStruct || this.tipoElemento.tipoDato.toString()));
        node.pushChild(tipoNode);

        const elementosNode = new Node('ELEMENTOS');
        for (let elem of this.elementos) {
            elementosNode.pushChild(elem.ast(arbol, tabla));
        }
        node.pushChild(elementosNode);
        return node;
    }
}
