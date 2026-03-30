%lex
%%

\s+                   /* ignorar espacios */
\t+                   /* ignorar tabs */
\n+                   /* ignorar nuevas líneas */

// Comentarios
"//".*                /* ignorar comentarios de línea */
"/*"(.|\n|\r)*?"*/"   /* ignorar comentarios multilínea */

// Palabras reservadas
"var"                 return 'VAR';
"func"                return 'FUNC';
"if"                  return 'IF';
"else"                return 'ELSE';
"for"                 return 'FOR';
"switch"              return 'SWITCH';
"case"                return 'CASE';
"default"             return 'DEFAULT';
"break"               return 'BREAK';
"continue"            return 'CONTINUE';
"return"              return 'RETURN';
"struct"              return 'STRUCT';
"true"                return 'TRUE';
"false"               return 'FALSE';
"nil"                 return 'NIL';
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
"+"                   return '+';
"-"                   return '-';
"*"                   return '*';
"/"                   return '/';
"%"                   return '%';
"=="                  return '==';
"!="                  return '!=';
"<"                   return '<';
">"                   return '>';
"<="                  return '<=';
">="                  return '>=';
"&&"                  return '&&';
"||"                  return '||';
"!"                   return '!';
"+="                  return '+=';
"-="                  return '-=';
"="                   return '=';
":="                  return ':=';

// Puntuación
"("                   return '(';
")"                   return ')';
"{"                   return '{';
"}"                   return '}';
"["                   return '[';
"]"                   return ']';
","                   return ',';
"."                   return '.';
";"                   return ';';

. {
    console.log("Carácter no reconocido: " + yytext);
}

<<EOF>>               return 'EOF';

/lex

%start program

%%

program
    : statements EOF { return $1; }
;

statements
    : statements statement { $$ = $1.concat($2); }
    | statement { $$ = [$1]; }
;

statement
    : variable_declaration
    | function_declaration
    | struct_declaration
    | expression_statement
    | if_statement
    | for_statement
    | switch_statement
    | break_statement
    | continue_statement
    | return_statement
;

// Placeholder para declaraciones y sentencias
variable_declaration
    : VAR IDENTIFIER type '=' expression { $$ = { type: 'variable_declaration', name: $2, varType: $3, value: $5 }; }
    | VAR IDENTIFIER type { $$ = { type: 'variable_declaration', name: $2, varType: $3 }; }
    | IDENTIFIER ':=' expression { $$ = { type: 'variable_declaration', name: $1, value: $3 }; }
;

type
    : INT
    | FLOAT64
    | STRING_TYPE
    | BOOL
    | RUNE
    | '[' ']' type { $$ = { type: 'slice', elementType: $3 }; }
    | IDENTIFIER { $$ = $1; } // Para structs
;

function_declaration
    : FUNC IDENTIFIER '(' parameters ')' type '{' statements '}' { $$ = { type: 'function_declaration', name: $2, params: $4, returnType: $6, body: $8 }; }
    | FUNC IDENTIFIER '(' parameters ')' '{' statements '}' { $$ = { type: 'function_declaration', name: $2, params: $4, body: $7 }; }
;

parameters
    : parameter_list { $$ = $1; }
    | /* empty */ { $$ = []; }
;

parameter_list
    : parameter_list ',' parameter { $$ = $1.concat($3); }
    | parameter { $$ = [$1]; }
;

parameter
    : IDENTIFIER type { $$ = { name: $1, type: $2 }; }
;

struct_declaration
    : STRUCT IDENTIFIER '{' struct_fields '}' { $$ = { type: 'struct_declaration', name: $2, fields: $4 }; }
;

struct_fields
    : struct_fields struct_field { $$ = $1.concat($2); }
    | struct_field { $$ = [$1]; }
;

struct_field
    : type IDENTIFIER ';' { $$ = { type: $1, name: $2 }; }
;

expression_statement
    : expression ';' { $$ = { type: 'expression_statement', expression: $1 }; }
;

if_statement
    : IF expression '{' statements '}' else_part { $$ = { type: 'if_statement', condition: $2, body: $4, else: $6 }; }
;

else_part
    : ELSE if_statement { $$ = $2; }
    | ELSE '{' statements '}' { $$ = $3; }
    | /* empty */ { $$ = null; }
;

for_statement
    : FOR expression '{' statements '}' { $$ = { type: 'for_statement', condition: $2, body: $4 }; }
    | FOR variable_declaration ';' expression ';' expression '{' statements '}' { $$ = { type: 'for_statement', init: $2, condition: $4, increment: $6, body: $8 }; }
    | FOR IDENTIFIER ',' IDENTIFIER ':=' RANGE expression '{' statements '}' { $$ = { type: 'for_range_statement', index: $2, value: $4, range: $7, body: $9 }; }
;

switch_statement
    : SWITCH expression '{' case_clauses '}' { $$ = { type: 'switch_statement', expression: $2, cases: $4 }; }
;

case_clauses
    : case_clauses case_clause { $$ = $1.concat($2); }
    | case_clause { $$ = [$1]; }
;

case_clause
    : CASE expression ':' statements { $$ = { type: 'case', value: $2, body: $4 }; }
    | DEFAULT ':' statements { $$ = { type: 'default', body: $3 }; }
;

break_statement
    : BREAK { $$ = { type: 'break' }; }
;

continue_statement
    : CONTINUE { $$ = { type: 'continue' }; }
;

return_statement
    : RETURN expression { $$ = { type: 'return', value: $2 }; }
    | RETURN { $$ = { type: 'return' }; }
;

expression
    : assignment_expression
;

assignment_expression
    : logical_or_expression
    | IDENTIFIER '=' assignment_expression { $$ = { type: 'assignment', left: $1, right: $3 }; }
    | IDENTIFIER '+=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '+=', right: $3 }; }
    | IDENTIFIER '-=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '-=', right: $3 }; }
;

logical_or_expression
    : logical_and_expression
    | logical_or_expression '||' logical_and_expression { $$ = { type: 'binary', operator: '||', left: $1, right: $3 }; }
;

logical_and_expression
    : equality_expression
    | logical_and_expression '&&' equality_expression { $$ = { type: 'binary', operator: '&&', left: $1, right: $3 }; }
;

equality_expression
    : relational_expression
    | equality_expression '==' relational_expression { $$ = { type: 'binary', operator: '==', left: $1, right: $3 }; }
    | equality_expression '!=' relational_expression { $$ = { type: 'binary', operator: '!=', left: $1, right: $3 }; }
;

relational_expression
    : additive_expression
    | relational_expression '<' additive_expression { $$ = { type: 'binary', operator: '<', left: $1, right: $3 }; }
    | relational_expression '>' additive_expression { $$ = { type: 'binary', operator: '>', left: $1, right: $3 }; }
    | relational_expression '<=' additive_expression { $$ = { type: 'binary', operator: '<=', left: $1, right: $3 }; }
    | relational_expression '>=' additive_expression { $$ = { type: 'binary', operator: '>=', left: $1, right: $3 }; }
;

additive_expression
    : multiplicative_expression
    | additive_expression '+' multiplicative_expression { $$ = { type: 'binary', operator: '+', left: $1, right: $3 }; }
    | additive_expression '-' multiplicative_expression { $$ = { type: 'binary', operator: '-', left: $1, right: $3 }; }
;

multiplicative_expression
    : unary_expression
    | multiplicative_expression '*' unary_expression { $$ = { type: 'binary', operator: '*', left: $1, right: $3 }; }
    | multiplicative_expression '/' unary_expression { $$ = { type: 'binary', operator: '/', left: $1, right: $3 }; }
    | multiplicative_expression '%' unary_expression { $$ = { type: 'binary', operator: '%', left: $1, right: $3 }; }
;

unary_expression
    : primary_expression
    | '!' unary_expression { $$ = { type: 'unary', operator: '!', operand: $2 }; }
    | '-' unary_expression { $$ = { type: 'unary', operator: '-', operand: $2 }; }
;

primary_expression
    : IDENTIFIER { $$ = { type: 'identifier', name: $1 }; }
    | NUMBER { $$ = { type: 'literal', value: Number(yytext), literalType: 'number' }; }
    | STRING_LITERAL { $$ = { type: 'literal', value: yytext.slice(1, -1), literalType: 'string' }; }
    | RUNE_LITERAL { $$ = { type: 'literal', value: yytext.slice(1, -1), literalType: 'rune' }; }
    | TRUE { $$ = { type: 'literal', value: true, literalType: 'bool' }; }
    | FALSE { $$ = { type: 'literal', value: false, literalType: 'bool' }; }
    | NIL { $$ = { type: 'literal', value: null, literalType: 'nil' }; }
    | '(' expression ')' { $$ = $2; }
    | function_call
    | slice_literal
    | struct_literal
    | member_access
    | array_access
;

function_call
    : IDENTIFIER '(' arguments ')' { $$ = { type: 'function_call', name: $1, args: $3 }; }
;

arguments
    : argument_list { $$ = $1; }
    | /* empty */ { $$ = []; }
;

argument_list
    : argument_list ',' expression { $$ = $1.concat($3); }
    | expression { $$ = [$1]; }
;

slice_literal
    : '[' ']' type '{' elements '}' { $$ = { type: 'slice_literal', elementType: $3, elements: $5 }; }
;

elements
    : element_list { $$ = $1; }
    | /* empty */ { $$ = []; }
;

element_list
    : element_list ',' expression { $$ = $1.concat($3); }
    | expression { $$ = [$1]; }
;

struct_literal
    : IDENTIFIER '{' field_initializers '}' { $$ = { type: 'struct_literal', structName: $1, fields: $3 }; }
;

field_initializers
    : field_initializer_list { $$ = $1; }
    | /* empty */ { $$ = {}; }
;

field_initializer_list
    : field_initializer_list ',' field_initializer { $$ = Object.assign($1, $3); }
    | field_initializer { $$ = $1; }
;

field_initializer
    : IDENTIFIER ':' expression { $$ = { [$1]: $3 }; }
;

member_access
    : primary_expression '.' IDENTIFIER { $$ = { type: 'member_access', object: $1, member: $3 }; }
;

array_access
    : primary_expression '[' expression ']' { $$ = { type: 'array_access', array: $1, index: $3 }; }
;