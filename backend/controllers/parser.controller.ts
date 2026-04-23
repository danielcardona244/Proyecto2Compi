import parser from "../src/grammar/parserWrapper";
import { Arbol } from "../src/Simbolo/Arbol";
import { TablaSimbolos } from "../src/Simbolo/TablaSimbolos";

export const analizar = (req: any, res: any) => {
    const { codigo, interpretar } = req.body;

    try {
        // Parsear el código
        const instrucciones = parser.parse(codigo);

        // Crear árbol y tabla de símbolos
        const arbol = new Arbol(instrucciones);
        const tabla = arbol.tablaGlobal;

        // Ejecutar instrucciones
        let consola = "";
        let errores: any[] = [];

        for (const instruccion of instrucciones) {
            const resultado = instruccion.interpretar(arbol, tabla);
            if (resultado instanceof Error) {
                errores.push(resultado);
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
                tipo: s.tipo.tipoDato,
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