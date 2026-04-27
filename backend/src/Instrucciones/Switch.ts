import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export interface Case {
    valor: Instruccion | null; // null para default
    sentencias: Instruccion[];
}

export class Switch extends Instruccion {
    public expresion: Instruccion;
    public casos: Case[];

    constructor(expresion: Instruccion, casos: Case[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.expresion = expresion;
        this.casos = casos;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorSwitch = this.expresion.interpretar(arbol, tabla);
        if (valorSwitch instanceof Errores) return valorSwitch;

        let defaultCase: Case | null = null;
        for (const caso of this.casos) {
            if (caso.valor === null) {
                defaultCase = caso;
                continue;
            }

            const valorCaso = caso.valor.interpretar(arbol, tabla);
            if (valorCaso instanceof Errores) return valorCaso;
            if (valorSwitch === valorCaso) return this.ejecutarCaso(caso, arbol, tabla);
        }

        return defaultCase ? this.ejecutarCaso(defaultCase, arbol, tabla) : null;
    }

    private ejecutarCaso(caso: Case, arbol: Arbol, tabla: TablaSimbolos): any {
        const tablaSwitch = new TablaSimbolos(tabla);
        for (const sentencia of caso.sentencias) {
            const resultado = sentencia.interpretar(arbol, tablaSwitch);
            if (resultado === "BREAK") return null;
            if (resultado instanceof Errores) return resultado;
            if (resultado !== null) return resultado;
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("SWITCH");
        node.pushChild(this.expresion.ast(arbol, tabla));
        for (const caso of this.casos) {
            let nodoCaso = new Node(caso.valor === null ? "DEFAULT" : "CASE");
            if (caso.valor !== null) {
                nodoCaso.pushChild(caso.valor.ast(arbol, tabla));
            }
            for (const sentencia of caso.sentencias) {
                nodoCaso.pushChild(sentencia.ast(arbol, tabla));
            }
            node.pushChild(nodoCaso);
        }
        return node;
    }
}
