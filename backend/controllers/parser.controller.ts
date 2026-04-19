import parser from "../src/grammar/parserWrapper";
import { ASTReporter } from "../src/ast/astReporter";
import { SymbolTable } from "../src/environment/symbolTable";
import { SymbolCollector } from "../src/environment/symbolCollector";
import { ErrorCollector } from "../src/errors/errorCollector";
import { Statement } from "../src/ast/nodes";

export const analizar = (req: any, res: any) => {
    const { codigo } = req.body;

    const errorCollector = new ErrorCollector();

    try {
        // Parsear el código
        const ast: Statement[] = parser.parse(codigo, errorCollector);

        // Generar reporte AST en formato DOT
        const reporter = new ASTReporter();
        const dotReport = reporter.generateReport(ast);

        // Recolectar símbolos
        const symbolTable = new SymbolTable();
        const collector = new SymbolCollector(symbolTable);
        collector.collectSymbols(ast);
        const symbols = symbolTable.getAllSymbols();

        // Generar tabla de símbolos formateada
        const symbolTableReport = symbols.map(symbol => ({
            'ID': symbol.id,
            'Tipo símbolo': symbol.type,
            'Tipo dato': symbol.dataType,
            'Ámbito': symbol.scope,
            'Línea': symbol.line,
            'Columna': symbol.column
        }));

        res.json({
            success: true,
            ast: ast,
            dotReport: dotReport,
            symbolTable: symbolTableReport,
            errors: errorCollector.getErrorTable(),
            message: "Análisis completado exitosamente"
        });

    } catch (error: any) {
        console.error("Error de parsing:", error);

        // Agregar error sintáctico
        errorCollector.addSyntacticError(
            error.message || "Error de sintaxis desconocido",
            error.location?.first_line || 1,
            error.location?.first_column || 1
        );

        res.json({
            success: false,
            errors: errorCollector.getErrorTable(),
            message: "Errores encontrados durante el análisis"
        });
    }
};