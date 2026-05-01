import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class Funcion extends Instruccion {
    public nombre: string;
    public parametros: any[];
    public tipoRetorno: Tipo | null;
    public instrucciones: Instruccion[];

    constructor(nombre: string, parametros: any[], tipoRetorno: Tipo | null, instrucciones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.nombre = nombre;
        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
        this.instrucciones = instrucciones;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        tabla.setFuncion(this.nombre, this);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node('FUNCION');
        node.pushChild(new Node(this.nombre));

        const paramsNode = new Node('PARAMETROS');
        for (const parametro of this.parametros) {
            const paramNode = new Node(parametro.nombre);
            if (parametro.tipo) {
                paramNode.pushChild(new Node(parametro.tipo.tipoDato?.toString() || 'TIPO'));
            }
            paramsNode.pushChild(paramNode);
        }
        node.pushChild(paramsNode);

        if (this.tipoRetorno) {
            const retornoNode = new Node('TIPO_RETORNO');
            retornoNode.pushChild(new Node(this.tipoRetorno.tipoDato.toString()));
            node.pushChild(retornoNode);
        }

        const instruccionesNode = new Node('INSTRUCCIONES');
        for (const instruccion of this.instrucciones) {
            instruccionesNode.pushChild(instruccion.ast(arbol, tabla));
        }
        node.pushChild(instruccionesNode);
        return node;
    }
}
