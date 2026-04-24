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
        for (let pair of this.pairs) {
            node.pushChild(pair.key.ast(arbol, tabla));
            node.pushChild(pair.value.ast(arbol, tabla));
        }
        return node;
    }
}
