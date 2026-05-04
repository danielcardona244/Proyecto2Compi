%{
// Instrucciones
const Declaracion = require("../Instrucciones/Declaracion").Declaracion;
const Asignacion = require("../Instrucciones/Asignacion").Asignacion;
const Print = require("../Instrucciones/Print").Print;
const If = require("../Instrucciones/If").If;
const For = require("../Instrucciones/For").For;
const Switch = require("../Instrucciones/Switch").Switch;
const Break = require("../Instrucciones/Break").Break;
const Continue = require("../Instrucciones/Continue").Continue;
const Retorno = require("../Instrucciones/Retorno").Retorno;
const Bloque = require("../Instrucciones/Bloque").Bloque;
const Funcion = require("../Instrucciones/Funcion").Funcion;
const Struct = require("../Instrucciones/Struct").Struct;
const ExpresionStatement = require("../Instrucciones/ExpresionStatement").ExpresionStatement;

// Expresiones
const Nativo = require("../Expresiones/Nativo").Nativo;
const Identificador = require("../Expresiones/Identificador").Identificador;
const Suma = require("../Expresiones/Suma").Suma;
const Resta = require("../Expresiones/Resta").Resta;
const Multiplicacion = require("../Expresiones/Multiplicacion").Multiplicacion;
const Division = require("../Expresiones/Division").Division;
const Igual = require("../Expresiones/Igual").Igual;
const Distinto = require("../Expresiones/Distinto").Distinto;
const MayorQue = require("../Expresiones/MayorQue").MayorQue;
const MenorQue = require("../Expresiones/MenorQue").MenorQue;
const MayorIgual = require("../Expresiones/MayorIgual").MayorIgual;
const MenorIgual = require("../Expresiones/MenorIgual").MenorIgual;
const LlamadaFuncion = require("../Expresiones/LlamadaFuncion").LlamadaFuncion;
const AccesoCampo = require("../Expresiones/AccesoCampo").AccesoCampo;
const AccesoArreglo = require("../Expresiones/AccesoArreglo").AccesoArreglo;
const SliceLiteral = require("../Expresiones/SliceLiteral").SliceLiteral;
const StructLiteral = require("../Expresiones/StructLiteral").StructLiteral;
const ListaLiteral = require("../Expresiones/ListaLiteral").ListaLiteral;
const MapLiteral = require("../Expresiones/MapLiteral").MapLiteral;
const Modulo = require("../Expresiones/Modulo").Modulo;
const Logica = require("../Expresiones/Logica").Logica;
const Unario = require("../Expresiones/Unario").Unario;

// Enums
const Tipo = require("../Simbolo/Tipo").Tipo;
const tipoDato = require("../Simbolo/tipoDato").tipoDato;
const OperadoresAritmeticos = require("../Expresiones/OperadoresAritmeticos").OperadoresAritmeticos;
const OperadoresRelacionales = require("../Expresiones/OperadoresRelacionales").OperadoresRelacionales;
%}

%lex
%%
[ \t\r\uFEFF]+           /* ignorar espacios, tabs, CR y BOM */
\n                        return 'NEWLINE';

// Comentarios
"//".*                /* ignorar comentarios de linea */
"/*"(.|\n|\r)*?"*/"   /* ignorar comentarios multilinea */

// Palabras reservadas
"var"                 return 'VAR';
"func"                return 'FUNC';
"if"                  return 'IF';
"else"                return 'ELSE';
"for"                 return 'FOR';
"range"               return 'RANGE';
"switch"              return 'SWITCH';
"case"                return 'CASE';
"default"             return 'DEFAULT';
"break"               return 'BREAK';
"continue"            return 'CONTINUE';
"return"              return 'RETURN';
"type"                return 'TYPE';
"struct"              return 'STRUCT';
"true"                return 'TRUE';
"false"               return 'FALSE';
"nil"                 return 'NIL';
"map"                 return 'MAP';
"fmt.Println"         return 'PRINTLN';
"slices.Index"        return 'BUILTIN_METHOD';
"strings.Join"        return 'BUILTIN_METHOD';
"strconv.Atoi"        return 'BUILTIN_METHOD';
"strconv.ParseFloat"  return 'BUILTIN_METHOD';
"reflect.TypeOf"      return 'BUILTIN_METHOD';
"int"                 return 'INT';
"float64"             return 'FLOAT64';
"string"              return 'STRING_TYPE';
"bool"                return 'BOOL';
"rune"                return 'RUNE';

// Literales
[0-9]+("."[0-9]+)?\b  return 'NUMBER';
\"([^\\\"]|\\.)*\"    return 'STRING_LITERAL';
\'([^\\\']|\\.)*\'    return 'RUNE_LITERAL';

// Identificadores
[a-zA-Z_][a-zA-Z0-9_]* return 'IDENTIFIER';

// Operadores
"=="                  return '==';
"!="                  return '!=';
"<="                  return '<=';
">="                  return '>=';
"&&"                  return '&&';
"||"                  return '||';
"+="                  return '+=';
"-="                  return '-=';
"*="                  return '*=';
"/="                  return '/=';
"%="                  return '%=';
"++"                  return '++';
"--"                  return '--';
":="                  return ':=';
"+"                   return '+';
"-"                   return '-';
"*"                   return '*';
"/"                   return '/';
"%"                   return '%';
"<"                   return '<';
">"                   return '>';
"!"                   return '!';
"="                   return '=';

// Puntuacion
"("                   return '(';
")"                   return ')';
"{"                   return '{';
"}"                   return '}';
"["                   return '[';
"]"                   return ']';
","                   return ',';
"."                   return '.';
";"                   return ';';
":"                   return ':';

. {
    if (typeof yy.errorCollector !== 'undefined') {
        yy.errorCollector.addLexicalError("Caracter no reconocido: " + yytext, yylloc.first_line, yylloc.first_column);
    }
}

<<EOF>>               return 'EOF';

/lex

%start program
%left '||'
%left '&&'
%left '==' '!='
%left '<' '<=' '>' '>='
%left '+' '-'
%left '*' '/' '%'
%right '!'

%%

program
    : separators optional_statements separators trailing_closings EOF { return $2; }
;

trailing_closings
    : /* empty */
    | trailing_closings '}' separators
;

optional_statements
    : /* empty */ { $$ = []; }
    | statements { $$ = $1; }
    | statements statement_separators { $$ = $1; }
;

statements
    : statement { $$ = [$1]; }
    | statements statement_separators statement { $$ = $1.concat($3); }
    | statements statement { $$ = $1.concat($2); }
;

separators
    : /* empty */
    | separators separator
;

statement_separators
    : separator
    | statement_separators separator
;

separator
    : ';'
    | NEWLINE
;

statement
    : print_statement
    | variable_declaration
    | assignment_statement
    | expression_statement
    | block_statement
    | if_statement
    | for_statement
    | switch_statement
    | break_statement
    | continue_statement
    | return_statement
    | function_declaration
    | struct_declaration
;

block_statement
    : '{' separators optional_statements separators '}' { $$ = new Bloque($3, @1.first_line, @1.first_column); }
;

variable_declaration
    : VAR IDENTIFIER INT '=' expression { $$ = new Declaracion(tipoDato.ENTERO, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER INT { $$ = new Declaracion(tipoDato.ENTERO, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER FLOAT64 '=' expression { $$ = new Declaracion(tipoDato.DECIMAL, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER FLOAT64 { $$ = new Declaracion(tipoDato.DECIMAL, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER STRING_TYPE '=' expression { $$ = new Declaracion(tipoDato.CADENA, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER STRING_TYPE { $$ = new Declaracion(tipoDato.CADENA, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER BOOL '=' expression { $$ = new Declaracion(tipoDato.BOOLEANO, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER BOOL { $$ = new Declaracion(tipoDato.BOOLEANO, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER RUNE '=' expression { $$ = new Declaracion(tipoDato.CARACTER, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER RUNE { $$ = new Declaracion(tipoDato.CARACTER, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER tipo { $$ = new Declaracion($3.tipoDato, $2, null, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER tipo '=' struct_literal { $$ = new Declaracion($3.tipoDato, $2, $5, @1.first_line, @1.first_column); }
    | VAR IDENTIFIER tipo '=' expression { $$ = new Declaracion($3.tipoDato, $2, $5, @1.first_line, @1.first_column); }
    | INT IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.ENTERO, $2, $4, @1.first_line, @1.first_column); }
    | FLOAT64 IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.DECIMAL, $2, $4, @1.first_line, @1.first_column); }
    | STRING_TYPE IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.CADENA, $2, $4, @1.first_line, @1.first_column); }
    | BOOL IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.BOOLEANO, $2, $4, @1.first_line, @1.first_column); }
    | RUNE IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.CARACTER, $2, $4, @1.first_line, @1.first_column); }
    | INT IDENTIFIER { $$ = new Declaracion(tipoDato.ENTERO, $2, null, @1.first_line, @1.first_column); }
    | FLOAT64 IDENTIFIER { $$ = new Declaracion(tipoDato.DECIMAL, $2, null, @1.first_line, @1.first_column); }
    | STRING_TYPE IDENTIFIER { $$ = new Declaracion(tipoDato.CADENA, $2, null, @1.first_line, @1.first_column); }
    | BOOL IDENTIFIER { $$ = new Declaracion(tipoDato.BOOLEANO, $2, null, @1.first_line, @1.first_column); }
    | RUNE IDENTIFIER { $$ = new Declaracion(tipoDato.CARACTER, $2, null, @1.first_line, @1.first_column); }
    | IDENTIFIER IDENTIFIER '=' struct_literal { $$ = new Declaracion(tipoDato.STRUCT, $2, $4, @1.first_line, @1.first_column); }
    | IDENTIFIER IDENTIFIER '=' expression { $$ = new Declaracion(tipoDato.STRUCT, $2, $4, @1.first_line, @1.first_column); }
    | IDENTIFIER ':=' struct_literal { $$ = new Declaracion(tipoDato.VOID, $1, $3, @1.first_line, @1.first_column); }
    | IDENTIFIER ':=' expression { $$ = new Declaracion(tipoDato.VOID, $1, $3, @1.first_line, @1.first_column); }
;

if_statement
    : IF expression '{' separators optional_statements separators '}' else_part { $$ = new If($2, $5, $8, @1.first_line, @1.first_column); }
;

else_part
    : ELSE '{' separators optional_statements separators '}' { $$ = $4; }
    | ELSE if_statement { $$ = [$2]; }
    | /* empty */ { $$ = null; }
;

for_statement
    : FOR expression '{' separators optional_statements separators '}' { $$ = new For(null, $2, null, $5, @1.first_line, @1.first_column); }
    | FOR assignment_statement ';' expression ';' assignment_statement '{' separators optional_statements separators '}' { $$ = new For($2, $4, $6, $9, @1.first_line, @1.first_column); }
    | FOR variable_declaration ';' expression ';' assignment_statement '{' separators optional_statements separators '}' { $$ = new For($2, $4, $6, $9, @1.first_line, @1.first_column); }
    | FOR IDENTIFIER ',' IDENTIFIER ':=' RANGE range_expression '{' separators optional_statements separators '}' { const f = new For(null, null, null, $10, @1.first_line, @1.first_column); f.setRange($2, $4, $7); $$ = f; }
;

range_expression
    : IDENTIFIER { $$ = new Identificador($1, @1.first_line, @1.first_column); }
    | IDENTIFIER '[' expression ']' { $$ = new AccesoArreglo(new Identificador($1, @1.first_line, @1.first_column), $3, @1.first_line, @1.first_column); }
    | IDENTIFIER '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | BUILTIN_METHOD '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | slice_literal { $$ = $1; }
;

switch_statement
    : SWITCH switch_expression '{' separators case_clauses separators '}' { $$ = new Switch($2, $5, @1.first_line, @1.first_column); }
;

switch_expression
    : IDENTIFIER { $$ = new Identificador($1, @1.first_line, @1.first_column); }
    | NUMBER { $$ = new Nativo(Number($1), new Tipo(String($1).includes('.') ? tipoDato.DECIMAL : tipoDato.ENTERO, false), @1.first_line, @1.first_column); }
    | STRING_LITERAL { $$ = new Nativo($1.slice(1, -1), new Tipo(tipoDato.CADENA, false), @1.first_line, @1.first_column); }
    | RUNE_LITERAL { $$ = new Nativo($1.slice(1, -1), new Tipo(tipoDato.CARACTER, false), @1.first_line, @1.first_column); }
    | TRUE { $$ = new Nativo(true, new Tipo(tipoDato.BOOLEANO, false), @1.first_line, @1.first_column); }
    | FALSE { $$ = new Nativo(false, new Tipo(tipoDato.BOOLEANO, false), @1.first_line, @1.first_column); }
    | IDENTIFIER '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | BUILTIN_METHOD '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | IDENTIFIER '[' expression ']' { $$ = new AccesoArreglo(new Identificador($1, @1.first_line, @1.first_column), $3, @1.first_line, @1.first_column); }
    | IDENTIFIER '.' IDENTIFIER { $$ = new AccesoCampo(new Identificador($1, @1.first_line, @1.first_column), $3, @1.first_line, @1.first_column); }
;

case_clauses
    : case_clauses case_clause { $$ = $1.concat($2); }
    | case_clause { $$ = [$1]; }
;

case_clause
    : CASE expression ':' separators optional_statements { $$ = { valor: $2, sentencias: $5 }; }
    | CASE expression ':' statement optional_statements { $$ = { valor: $2, sentencias: [$4].concat($5) }; }
    | CASE expression ':' optional_statements { $$ = { valor: $2, sentencias: $4 }; }
    | DEFAULT ':' separators optional_statements { $$ = { valor: null, sentencias: $4 }; }
    | DEFAULT ':' statement optional_statements { $$ = { valor: null, sentencias: [$3].concat($4) }; }
    | DEFAULT ':' optional_statements { $$ = { valor: null, sentencias: $3 }; }
;

break_statement
    : BREAK { $$ = new Break(@1.first_line, @1.first_column); }
;

continue_statement
    : CONTINUE { $$ = new Continue(@1.first_line, @1.first_column); }
;

function_declaration
    : FUNC IDENTIFIER '(' parameters ')' return_type '{' separators optional_statements separators '}' { $$ = new Funcion($2, $4, $6, $9, @1.first_line, @1.first_column); }
;

struct_declaration
    : STRUCT IDENTIFIER '{' separators field_declarations separators '}' { $$ = new Struct($2, $5, @1.first_line, @1.first_column); }
    | TYPE IDENTIFIER STRUCT '{' separators field_declarations separators '}' { $$ = new Struct($2, $6, @1.first_line, @1.first_column); }
;

parameters
    : /* empty */ { $$ = []; }
    | parameter_list { $$ = $1; }
;

parameter_list
    : parameter { $$ = [$1]; }
    | parameter_list ',' parameter { $$ = $1.concat($3); }
;

parameter
    : IDENTIFIER tipo { $$ = { nombre: $1, tipo: $2 }; }
;

return_type
    : /* empty */ { $$ = null; }
    | tipo { $$ = $1; }
;

field_declarations
    : /* empty */ { $$ = []; }
    | field_declaration { $$ = [$1]; }
    | field_declarations field_declaration { $$ = $1.concat($2); }
    | field_declarations separators field_declaration { $$ = $1.concat($3); }
;

field_declaration
    : tipo IDENTIFIER separator { $$ = { nombre: $2, tipo: $1 }; }
    | IDENTIFIER tipo separator { $$ = { nombre: $1, tipo: $2 }; }
;

tipo
    : INT { $$ = new Tipo(tipoDato.ENTERO, false); }
    | FLOAT64 { $$ = new Tipo(tipoDato.DECIMAL, false); }
    | STRING_TYPE { $$ = new Tipo(tipoDato.CADENA, false); }
    | BOOL { $$ = new Tipo(tipoDato.BOOLEANO, false); }
    | RUNE { $$ = new Tipo(tipoDato.CARACTER, false); }
    | '[' ']' tipo { $$ = new Tipo(tipoDato.SLICE, false, $3); }
    | IDENTIFIER { $$ = new Tipo(tipoDato.STRUCT, false, undefined, $1); }
;

assignment_statement
    : IDENTIFIER '=' struct_literal { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '='); }
    | IDENTIFIER '=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '='); }
    | IDENTIFIER '+=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '+='); }
    | IDENTIFIER '-=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '-='); }
    | IDENTIFIER '*=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '*='); }
    | IDENTIFIER '/=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '/='); }
    | IDENTIFIER '%=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '%='); }
    | IDENTIFIER '++' { $$ = new Asignacion($1, new Nativo(1, new Tipo(tipoDato.ENTERO, false), @1.first_line, @1.first_column), @1.first_line, @1.first_column, '+='); }
    | IDENTIFIER '--' { $$ = new Asignacion($1, new Nativo(1, new Tipo(tipoDato.ENTERO, false), @1.first_line, @1.first_column), @1.first_line, @1.first_column, '-='); }
    | array_access '=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '='); }
    | field_access '=' expression { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column, '='); }
;

expression_statement
    : expression { $$ = new ExpresionStatement($1, @1.first_line, @1.first_column); }
;

print_statement
    : PRINTLN '(' arguments ')' { $$ = new LlamadaFuncion("fmt.Println", $3, @1.first_line, @1.first_column); }
;

return_statement
    : RETURN return_expression { $$ = new Retorno($2, @1.first_line, @1.first_column); }
;

return_expression
    : expression
    | /* empty */ { $$ = null; }
;

expression
    : assignment_expression
;

assignment_expression
    : logical_or_expression
;

logical_or_expression
    : logical_and_expression
    | logical_or_expression '||' logical_and_expression { $$ = new Logica($1, $3, '||', @1.first_line, @1.first_column); }
;

logical_and_expression
    : equality_expression
    | logical_and_expression '&&' equality_expression { $$ = new Logica($1, $3, '&&', @1.first_line, @1.first_column); }
;

equality_expression
    : relational_expression
    | equality_expression '==' relational_expression { $$ = new Igual($1, $3, OperadoresRelacionales.IGUAL, @1.first_line, @1.first_column); }
    | equality_expression '!=' relational_expression { $$ = new Distinto($1, $3, @1.first_line, @1.first_column); }
;

relational_expression
    : additive_expression
    | relational_expression '<' additive_expression { $$ = new MenorQue($1, $3, @1.first_line, @1.first_column); }
    | relational_expression '<=' additive_expression { $$ = new MenorIgual($1, $3, @1.first_line, @1.first_column); }
    | relational_expression '>' additive_expression { $$ = new MayorQue($1, $3, @1.first_line, @1.first_column); }
    | relational_expression '>=' additive_expression { $$ = new MayorIgual($1, $3, @1.first_line, @1.first_column); }
;

additive_expression
    : multiplicative_expression
    | additive_expression '+' multiplicative_expression { $$ = new Suma($1, $3, OperadoresAritmeticos.SUMA, @1.first_line, @1.first_column); }
    | additive_expression '-' multiplicative_expression { $$ = new Resta($1, $3, OperadoresAritmeticos.RESTA, @1.first_line, @1.first_column); }
;

multiplicative_expression
    : unary_expression
    | multiplicative_expression '*' unary_expression { $$ = new Multiplicacion($1, $3, OperadoresAritmeticos.MULTIPLICACION, @1.first_line, @1.first_column); }
    | multiplicative_expression '/' unary_expression { $$ = new Division($1, $3, OperadoresAritmeticos.DIVISION, @1.first_line, @1.first_column); }
    | multiplicative_expression '%' unary_expression { $$ = new Modulo($1, $3, @1.first_line, @1.first_column); }
;

unary_expression
    : primary_expression
    | '!' unary_expression { $$ = new Unario('!', $2, @1.first_line, @1.first_column); }
    | '-' unary_expression { $$ = new Unario('-', $2, @1.first_line, @1.first_column); }
;

primary_expression
    : function_call
    | IDENTIFIER { $$ = new Identificador($1, @1.first_line, @1.first_column); }
    | NUMBER { $$ = new Nativo(Number($1), new Tipo(String($1).includes('.') ? tipoDato.DECIMAL : tipoDato.ENTERO, false), @1.first_line, @1.first_column); }
    | STRING_LITERAL { $$ = new Nativo($1.slice(1, -1), new Tipo(tipoDato.CADENA, false), @1.first_line, @1.first_column); }
    | RUNE_LITERAL { $$ = new Nativo($1.slice(1, -1), new Tipo(tipoDato.CARACTER, false), @1.first_line, @1.first_column); }
    | TRUE { $$ = new Nativo(true, new Tipo(tipoDato.BOOLEANO, false), @1.first_line, @1.first_column); }
    | FALSE { $$ = new Nativo(false, new Tipo(tipoDato.BOOLEANO, false), @1.first_line, @1.first_column); }
    | NIL { $$ = new Nativo(null, new Tipo(tipoDato.VOID, false), @1.first_line, @1.first_column); }
    | '(' expression ')' { $$ = $2; }
    | field_access
    | array_access
    | slice_literal
    | list_literal
    | map_literal
;

function_call
    : IDENTIFIER '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | BUILTIN_METHOD '(' arguments ')' { $$ = new LlamadaFuncion($1, $3, @1.first_line, @1.first_column); }
    | INT '(' arguments ')' { $$ = new LlamadaFuncion("int", $3, @1.first_line, @1.first_column); }
    | FLOAT64 '(' arguments ')' { $$ = new LlamadaFuncion("float64", $3, @1.first_line, @1.first_column); }
    | STRING_TYPE '(' arguments ')' { $$ = new LlamadaFuncion("string", $3, @1.first_line, @1.first_column); }
    | BOOL '(' arguments ')' { $$ = new LlamadaFuncion("bool", $3, @1.first_line, @1.first_column); }
;

arguments
    : /* empty */ { $$ = []; }
    | expression_list { $$ = $1; }
;

expression_list
    : expression { $$ = [$1]; }
    | expression_list ',' expression { $$ = $1.concat($3); }
    | expression_list ',' separators expression { $$ = $1.concat($4); }
;

field_access
    : primary_expression '.' field_name { $$ = new AccesoCampo($1, $3, @1.first_line, @1.first_column); }
;

field_name
    : IDENTIFIER { $$ = $1; }
    | STRING_TYPE { $$ = "string"; }
    | INT { $$ = "int"; }
    | FLOAT64 { $$ = "float64"; }
    | BOOL { $$ = "bool"; }
    | RUNE { $$ = "rune"; }
;

array_access
    : primary_expression '[' expression ']' { $$ = new AccesoArreglo($1, $3, @1.first_line, @1.first_column); }
;

slice_literal
    : '[' ']' tipo '{' expression_list '}' { $$ = new SliceLiteral($3, $5, @1.first_line, @1.first_column); }
    | '[' ']' tipo '{' separators expression_list separators '}' { $$ = new SliceLiteral($3, $6, @1.first_line, @1.first_column); }
    | '[' ']' tipo '{' separators expression_list ',' separators '}' { $$ = new SliceLiteral($3, $6, @1.first_line, @1.first_column); }
    | '[' ']' tipo '{' '}' { $$ = new SliceLiteral($3, [], @1.first_line, @1.first_column); }
;

list_literal
    : '{' expression_list '}' { $$ = new ListaLiteral($2, @1.first_line, @1.first_column); }
    | '{' separators expression_list separators '}' { $$ = new ListaLiteral($3, @1.first_line, @1.first_column); }
    | '{' separators expression_list ',' separators '}' { $$ = new ListaLiteral($3, @1.first_line, @1.first_column); }
    | '{' '}' { $$ = new ListaLiteral([], @1.first_line, @1.first_column); }
;

struct_literal
    : IDENTIFIER '{' field_values '}' { $$ = new StructLiteral($1, $3, @1.first_line, @1.first_column); }
    | '{' field_values '}' { $$ = new StructLiteral(null, $2, @1.first_line, @1.first_column); }
;

field_values
    : field_value { $$ = [$1]; }
    | field_values ',' field_value { $$ = $1.concat($3); }
;

field_value
    : IDENTIFIER ':' struct_literal { $$ = { nombre: $1, valor: $3 }; }
    | IDENTIFIER ':' expression { $$ = { nombre: $1, valor: $3 }; }
;

map_literal
    : MAP '[' tipo ']' tipo '{' key_value_pairs '}' { $$ = new MapLiteral($3, $5, $7, @1.first_line, @1.first_column); }
;

key_value_pairs
    : /* empty */ { $$ = []; }
    | key_value_list { $$ = $1; }
;

key_value_list
    : key_value_pair { $$ = [$1]; }
    | key_value_list ',' key_value_pair { $$ = $1.concat($3); }
;

key_value_pair
    : expression ':' expression { $$ = { key: $1, value: $3 }; }
;
