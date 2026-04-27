import parser from "../src/grammar/parserWrapper";
import { Arbol } from "../src/Simbolo/Arbol";
import { TablaSimbolos } from "../src/Simbolo/TablaSimbolos";
import { Funcion } from "../src/Instrucciones/Funcion";
import { Struct } from "../src/Instrucciones/Struct";
import { Simbolo } from "../src/Simbolo/Simbolo";
import { Tipo } from "../src/Simbolo/Tipo";
import { tipoDato } from "../src/Simbolo/tipoDato";

export const analizar = (req: any, res: any) => {
    const { codigo, interpretar } = req.body;

    try {
        let errores: any[] = [];
        let consola: string = "";

        // Parsear el código
        const instrucciones = parser.parse(codigo);

        // Crear árbol y tabla de símbolos
        const arbol = new Arbol(instrucciones);
        const tabla = arbol.tablaGlobal;

        // Ejecutar instrucciones para definir funciones y structs
        for (const instruccion of instrucciones) {
            if (instruccion instanceof Funcion || instruccion instanceof Struct) {
                instruccion.interpretar(arbol, tabla);
                const tipoSimbolo = instruccion instanceof Funcion ? "Funcion" : "Struct";
                arbol.simbolos.push(new Simbolo(instruccion.nombre, new Tipo(tipoDato.VOID, false), null, instruccion.linea, instruccion.columna, tipoSimbolo, tabla.nombre));
            }
        }

        // Buscar y ejecutar función main
        const mainFunc = tabla.getFuncion('main');
        if (mainFunc) {
            // Crear nueva tabla para el scope de main
            const tablaMain = new TablaSimbolos(tabla, "main");
            // Ejecutar instrucciones de main
            for (const instr of mainFunc.instrucciones) {
                const resultado = instr.interpretar(arbol, tablaMain);
                if (resultado !== null) break; // Si hay return
            }
        } else {
            // Si no hay main, ejecutar todas las instrucciones como antes
            for (const instruccion of instrucciones) {
                if (!(instruccion instanceof Funcion) && !(instruccion instanceof Struct)) {
                    const resultado = instruccion.interpretar(arbol, tabla);
                    if (resultado instanceof Error) {
                        errores.push(resultado);
                    }
                }
            }
        }

        // Obtener la salida
        consola = arbol.consola;
        errores = arbol.errores.map(err => ({
            tipo: err.tipo,
            descripcion: err.descripcion,
            linea: err.linea,
            columna: err.columna
        }));

        res.status(200).json({
            estado: 'exito',
            salida: consola,
            errores: errores,
            simbolos: arbol.simbolos.map(s => ({
                id: s.id,
                tipoSimbolo: s.tipoSimbolo,
                tipo: s.tipo.tipoDato,
                ambito: s.ambito,
                valor: s.valor,
                linea: s.linea,
                columna: s.columna
            }))
        });
    } catch (error: any) {
        res.status(400).json({
            estado: 'error',
            mensaje: error.message || 'Error durante el análisis',
            detalles: error.toString()
        });
    }
};

export const getAST = (req: any, res: any) => {
    const { codigo } = req.body;

    try {
        const instrucciones = parser.parse(codigo);
        const arbol = new Arbol(instrucciones);
        const tabla = arbol.tablaGlobal;

        // Generar AST en formato DOT
        let dot = 'digraph AST {\n';
        dot += '  node [shape=box];\n';

        const generateDot = (node: any, id: number): string => {
            let result = `  ${id} [label="${node.valor}"];\n`;
            let childId = id + 1;
            for (const child of node.hijos) {
                result += `  ${id} -> ${childId};\n`;
                result += generateDot(child, childId);
                childId++;
            }
            return result;
        };

        for (let i = 0; i < instrucciones.length; i++) {
            const astNode = instrucciones[i].ast(arbol, tabla);
            dot += generateDot(astNode, i);
        }
        dot += '}';

        res.status(200).json({
            estado: 'exito',
            ast: dot
        });
    } catch (error: any) {
        res.status(400).json({
            estado: 'error',
            mensaje: error.message
        });
    }
};

export const getSimbolos = (req: any, res: any) => {
    const { codigo } = req.body;

    try {
        const instrucciones = parser.parse(codigo);
        const arbol = new Arbol(instrucciones);
        const tabla = arbol.tablaGlobal;

        // Ejecutar para poblar tabla
        for (const instruccion of instrucciones) {
            if (instruccion instanceof Funcion || instruccion instanceof Struct) {
                instruccion.interpretar(arbol, tabla);
                const tipoSimbolo = instruccion instanceof Funcion ? "Funcion" : "Struct";
                arbol.simbolos.push(new Simbolo(instruccion.nombre, new Tipo(tipoDato.VOID, false), null, instruccion.linea, instruccion.columna, tipoSimbolo, tabla.nombre));
            }
        }

        const mainFunc = tabla.getFuncion("main");
        if (mainFunc) {
            const tablaMain = new TablaSimbolos(tabla, "main");
            for (const instr of mainFunc.instrucciones) {
                const resultado = instr.interpretar(arbol, tablaMain);
                if (resultado !== null) break;
            }
        } else {
            for (const instruccion of instrucciones) {
                if (!(instruccion instanceof Funcion) && !(instruccion instanceof Struct)) {
                    instruccion.interpretar(arbol, tabla);
                }
            }
        }

        const simbolos = arbol.simbolos.map(s => ({
            id: s.id,
            tipoSimbolo: s.tipoSimbolo,
            tipo: s.tipo.tipoDato,
            ambito: s.ambito,
            valor: s.valor,
            linea: s.linea,
            columna: s.columna
        }));

        res.status(200).json({
            estado: 'exito',
            simbolos: simbolos
        });
    } catch (error: any) {
        res.status(400).json({
            estado: 'error',
            mensaje: error.message
        });
    }
};
