import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class AccesoCampo extends Instruccion {
    public objeto: Instruccion;
    public campo: string;

    constructor(objeto: Instruccion, campo: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.objeto = objeto;
        this.campo = campo;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let obj = this.objeto.interpretar(arbol, tabla);
        if (this.campo === 'string' && typeof obj === 'string') {
            return obj;
        }
        if (obj && typeof obj === 'object' && obj[this.campo] !== undefined) {
            return obj[this.campo];
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('ACCESO_CAMPO');
        node.pushChild(this.objeto.ast(arbol, tabla));
        node.pushChild(new Node(this.campo));
        return node;
    }
}
