import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export class Print extends Instruccion {
    private expresion: Instruccion | Instruccion[];

    constructor(expresion: Instruccion | Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.expresion = expresion;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const expresiones = Array.isArray(this.expresion) ? this.expresion : [this.expresion];
        const valores = expresiones.map(exp => exp.interpretar(arbol, tabla));
        const error = valores.find(valor => valor instanceof Errores);
        if (error instanceof Errores) return error;
        arbol.print(valores.map(valor => this.formatear(valor)).join(" "));
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("PRINT");
        const expresiones = Array.isArray(this.expresion) ? this.expresion : [this.expresion];
        for (const expresion of expresiones) {
            node.pushChild(expresion.ast(arbol, tabla));
        }
        return node;
    }

    private formatear(valor: any): string {
        if (valor === null || valor === undefined) return "nil";
        if (Array.isArray(valor)) return `[${valor.map(item => this.formatear(item)).join(" ")}]`;
        return String(valor);
    }
}
