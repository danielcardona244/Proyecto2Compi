import parser from "../src/grammar/parserWrapper";
import { Arbol } from "../src/Simbolo/Arbol";
import { TablaSimbolos } from "../src/Simbolo/TablaSimbolos";
import { Funcion } from "../src/Instrucciones/Funcion";
import { Struct } from "../src/Instrucciones/Struct";
import { Simbolo } from "../src/Simbolo/Simbolo";
import { Tipo } from "../src/Simbolo/Tipo";
import { tipoDato } from "../src/Simbolo/tipoDato";
import { ErrorCollector } from "../src/errors/errorCollector";

export const analizar = (req: any, res: any) => {
    const { codigo, interpretar } = req.body;

    try {
        let errores: any[] = [];
        let consola: string = "";

        // Parsear el código
        const errorCollector = new ErrorCollector();
        const instrucciones = parser.parse(codigo, errorCollector);

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
        for (const instruccion of instrucciones) {
            if (!(instruccion instanceof Funcion) && !(instruccion instanceof Struct)) {
                const resultado = instruccion.interpretar(arbol, tabla);
                if (resultado instanceof Error) errores.push(resultado);
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
            arbol.errores.push({ tipo: "SEMANTICO", descripcion: "Funcion main no definida", linea: 1, columna: 1 } as any);
        }

        // Obtener la salida
        consola = arbol.consola;
        errores = errorCollector.getErrors().map(err => ({
            tipo: err.type === "lexical" ? "Lexico" : err.type === "syntactic" ? "Sintactico" : "Semantico",
            descripcion: err.description,
            linea: err.line,
            columna: err.column
        })).concat(arbol.errores.map(err => ({
            tipo: err.tipo,
            descripcion: err.descripcion,
            linea: err.linea,
            columna: err.columna
        })));

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
        const errorCollector = new ErrorCollector();
        const instrucciones = parser.parse(codigo, errorCollector);
        const arbol = new Arbol(instrucciones);
        const tabla = arbol.tablaGlobal;

        // Generar AST en formato DOT
        let dot = 'digraph AST {\n';
        dot += '  node [shape=box];\n';

        let nodeCounter = 0;
        const escapeDot = (value: any): string => String(value ?? "")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n");

        const generateDot = (node: any): { dot: string; id: number } => {
            const id = nodeCounter++;
            let result = `  n${id} [label="${escapeDot(node.valor)}"];\n`;
            for (const child of node.hijos) {
                const childResult = generateDot(child);
                result += childResult.dot;
                result += `  n${id} -> n${childResult.id};\n`;
            }
            return { dot: result, id };
        };

        for (let i = 0; i < instrucciones.length; i++) {
            const astNode = instrucciones[i].ast(arbol, tabla);
            dot += generateDot(astNode).dot;
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
        const errorCollector = new ErrorCollector();
        const instrucciones = parser.parse(codigo, errorCollector);
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
        for (const instruccion of instrucciones) {
            if (!(instruccion instanceof Funcion) && !(instruccion instanceof Struct)) {
                instruccion.interpretar(arbol, tabla);
            }
        }

        const mainFunc = tabla.getFuncion("main");
        if (mainFunc) {
            const tablaMain = new TablaSimbolos(tabla, "main");
            for (const instr of mainFunc.instrucciones) {
                const resultado = instr.interpretar(arbol, tablaMain);
                if (resultado !== null) break;
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
