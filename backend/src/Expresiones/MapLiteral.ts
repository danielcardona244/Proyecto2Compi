import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';
import { MapType } from '../Simbolo/Map';

export class MapLiteral extends Instruccion {
    public keyType: Tipo;
    public valueType: Tipo;
    public pairs: any[];

    constructor(keyType: Tipo, valueType: Tipo, pairs: any[], linea: number, columna: number) {
        super(new Tipo(tipoDato.ENTERO, false), linea, columna); // Placeholder
        this.keyType = keyType;
        this.valueType = valueType;
        this.pairs = pairs;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const map = new MapType(this.keyType, this.valueType);
        for (const pair of this.pairs) {
            const key = pair.key.interpretar(arbol, tabla);
            const value = pair.value.interpretar(arbol, tabla);
            map.set(key, value);
        }
        return map;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('MAP_LITERAL');
        const keyTypeNode = new Node('TIPO_CLAVE');
        keyTypeNode.pushChild(new Node(this.keyType.nombreStruct || this.keyType.tipoDato.toString()));
        node.pushChild(keyTypeNode);

        const valueTypeNode = new Node('TIPO_VALOR');
        valueTypeNode.pushChild(new Node(this.valueType.nombreStruct || this.valueType.tipoDato.toString()));
        node.pushChild(valueTypeNode);

        const pairsNode = new Node('PARES');
        for (let pair of this.pairs) {
            const pairNode = new Node('PAR');
            const keyNode = new Node('CLAVE');
            keyNode.pushChild(pair.key.ast(arbol, tabla));
            const valueNode = new Node('VALOR');
            valueNode.pushChild(pair.value.ast(arbol, tabla));
            pairNode.pushChild(keyNode);
            pairNode.pushChild(valueNode);
            pairsNode.pushChild(pairNode);
        }
        node.pushChild(pairsNode);
        return node;
    }
}
