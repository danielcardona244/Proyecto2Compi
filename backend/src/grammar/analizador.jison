%lex
%%
[ \t]+                   /* ignorar espacios y tabs */
\n                        return 'NEWLINE';

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
"<="                  return '<=';
">"                   return '>';
">="                  return '>=';
"&&"                  return '&&';
"||"                  return '||';
"!"                   return '!';
"+="                  return '+=';
"-="                  return '-=';
"*="                  return '*=';
"/="                  return '/=';
"%="                  return '%=';
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
    if (typeof yy.errorCollector !== 'undefined') {
        yy.errorCollector.addLexicalError("Carácter no reconocido: " + yytext, yylloc.first_line, yylloc.first_column);
    }
    return 'INVALID_TOKEN';
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
%nonassoc '(' '.' '{' IDENTIFIER

%%

program
    : statements EOF { return $1; }
;

statements
    : /* empty */ { $$ = []; }
    | statement { $$ = [$1]; }
    | statements statement_separator statement { $$ = $1.concat($3); }
;

statement_separator
    : ';'
    | NEWLINE
;

statement
    : variable_declaration
    | function_declaration
    | struct_declaration
    | expression
    | if_statement
    | for_statement
    | switch_statement
    | break_statement
    | continue_statement
    | return_statement
;

variable_declaration
    : VAR IDENTIFIER type '=' expression { $$ = { type: 'variable_declaration', name: $2, varType: $3, value: $5 }; }
    | IDENTIFIER ':=' expression { $$ = { type: 'variable_declaration', name: $1, value: $3 }; }
;

function_declaration
    : FUNC IDENTIFIER '(' parameters ')' type '{' statements '}' { $$ = { type: 'function_declaration', name: $2, params: $4, returnType: $6, body: $8 }; }
    | FUNC IDENTIFIER '(' parameters ')' '{' statements '}' { $$ = { type: 'function_declaration', name: $2, params: $4, body: $7 }; }
;

type
    : INT { $$ = 'int'; }
    | FLOAT64 { $$ = 'float64'; }
    | STRING_TYPE { $$ = 'string'; }
    | BOOL { $$ = 'bool'; }
    | RUNE { $$ = 'rune'; }
    | '[' ']' type { $$ = { type: 'slice', elementType: $3 }; }
    | IDENTIFIER { $$ = $1; }
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
    : RETURN return_expression { $$ = { type: 'return', value: $2 }; }
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
    | IDENTIFIER '=' assignment_expression { $$ = { type: 'assignment', left: $1, right: $3 }; }
    | IDENTIFIER '+=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '+=', right: $3 }; }
    | IDENTIFIER '-=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '-=', right: $3 }; }
    | IDENTIFIER '*=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '*=', right: $3 }; }
    | IDENTIFIER '/=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '/=', right: $3 }; }
    | IDENTIFIER '%=' assignment_expression { $$ = { type: 'assignment', left: $1, operator: '%=', right: $3 }; }
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
    | relational_expression '<=' additive_expression { $$ = { type: 'binary', operator: '<=', left: $1, right: $3 }; }
    | relational_expression '>' additive_expression { $$ = { type: 'binary', operator: '>', left: $1, right: $3 }; }
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
    : IDENTIFIER primary_suffix { $$ = $2($1); }
    | NUMBER
    | STRING_LITERAL
    | RUNE_LITERAL
    | TRUE
    | FALSE
    | NIL
    | '(' expression ')'
    | array_literal
;

primary_suffix
    : /* empty */ %prec IDENTIFIER { $$ = function(id) { return { type: 'variable', name: id }; }; }
    | '(' arguments ')' %prec '(' { $$ = function(id) { return { type: 'function_call', name: id, args: $2 }; }; }
    | '.' IDENTIFIER '(' arguments ')' %prec '.' { $$ = function(id) { return { type: 'method_call', object: { type: 'variable', name: id }, method: $2, args: $4 }; }; }
    | '{' '}' %prec '{' { $$ = function(id) { return { type: 'struct_literal', structType: id, fields: {} }; }; }
    | '{' field_list '}' %prec '{' { $$ = function(id) { return { type: 'struct_literal', structType: id, fields: $2 }; }; }
;

arguments
    : argument_list { $$ = $1; }
    | /* empty */ { $$ = []; }
;

argument_list
    : argument_list ',' expression { $$ = $1.concat($3); }
    | expression { $$ = [$1]; }
;

array_literal
    : '[' ']' type '{' '}' { $$ = { type: 'array_literal', elementType: $3, elements: [] }; }
    | '[' ']' type '{' argument_list '}' { $$ = { type: 'array_literal', elementType: $3, elements: $5 }; }
;

field_list
    : field_list ',' field { $$ = Object.assign($1, $3); }
    | field { $$ = $1; }
;

field
    : IDENTIFIER ':' expression { $$ = { [$1]: $3 }; }
;
