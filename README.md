# Proyecto 2 - Interprete GoScript

Este proyecto es un interprete web para **GoScript**, un lenguaje inspirado en Go.  
La idea principal es poder escribir codigo `.gst`, ejecutarlo desde un IDE web y generar los reportes pedidos para Compiladores 1: salida en consola, tabla de simbolos, reporte de errores y AST.

## Tecnologias usadas

- **Frontend:** React + TypeScript
- **Editor:** Monaco Editor
- **Backend:** Node.js + TypeScript + Express
- **Parser:** Jison
- **AST:** DOT / Graphviz renderizado desde el IDE
- **Estilos:** CSS personalizado

## Estructura del proyecto

```text
Proyecto2Compi/
|-- backend/
|   |-- controllers/          # Controladores REST
|   |-- routes/               # Rutas de la API
|   |-- models/               # Configuracion del servidor
|   `-- src/
|       |-- grammar/          # Gramatica Jison y parser generado
|       |-- Expresiones/      # Expresiones del lenguaje
|       |-- Instrucciones/    # Instrucciones del lenguaje
|       |-- Simbolo/          # Tabla de simbolos, tipos y entorno
|       `-- Excepciones/      # Manejo de errores
|-- frontend/
|   `-- src/                  # IDE web
`-- docs/
    `-- README.md
```

## Instalacion

Instalar dependencias del backend:

```bash
cd backend
npm install
```

Instalar dependencias del frontend:

```bash
cd frontend
npm install
```

## Ejecucion

Primero levantar el backend:

```bash
cd backend
npm run dev
```

Por defecto el backend queda en:

```text
http://localhost:3001
```

Luego levantar el frontend:

```bash
cd frontend
npm start
```

Por defecto el IDE queda en:

```text
http://localhost:3000
```

## Regenerar el parser

Cada vez que se modifica la gramatica Jison se debe regenerar el parser:

```bash
cd backend
npm run parse
```

Esto toma el archivo:

```text
backend/src/grammar/analizador.jison
```

y genera:

```text
backend/src/grammar/parser.js
```

## Endpoints principales

El backend expone estos endpoints:

```text
POST /api/parser/analizar
POST /api/parser/ast
POST /api/parser/simbolos
```

Todos reciben un JSON con el codigo fuente:

```json
{
  "codigo": "func main() { fmt.Println(\"Hola GoScript\") }"
}
```

## Funcionalidades implementadas

### Basicas

- Declaracion explicita de variables
- Declaracion implicita con `:=`
- Reasignacion de variables
- Operadores aritmeticos
- Operadores relacionales
- Operadores logicos
- `fmt.Println`
- Valor `nil`
- Punto y coma opcional
- Incremento y decremento con `i++` e `i--`

### Control de flujo

- `if`
- `else if`
- `else`
- `switch`
- `case`
- `default`
- `for` tipo while
- `for` clasico
- `for range`
- `break`
- `continue`
- `return`

### Funciones

- Funciones sin parametros
- Funciones con parametros
- Funciones recursivas
- Retorno de valores
- Slice como parametro
- Slice como retorno
- Soporte para pruebas como Fibonacci, Ackermann, Factorial y Hanoi

### Funciones nativas

- `fmt.Println`
- `len`
- `append`
- `slices.Index`
- `strings.Join`
- `strconv.Atoi`
- `strconv.ParseFloat`
- `reflect.TypeOf`

### Slices

- Creacion de slices
- Acceso por indice
- Asignacion por indice
- Slices multidimensionales
- `append` incluso sobre slices inicialmente `nil`
- Retorno de slices desde funciones

### Structs

- Declaracion de structs
- Instanciacion
- Acceso a propiedades
- Asignacion a propiedades
- Structs anidados
- Paso por referencia en funciones

## Reportes

El IDE permite visualizar:

- Consola de salida
- Reporte de errores lexicos, sintacticos y semanticos
- Tabla de simbolos
- AST en formato DOT y como grafico

## Entrada del programa

El interprete busca la funcion:

```go
func main() {
    // instrucciones
}
```

Desde ahi empieza la ejecucion del programa.

## Ejemplo rapido

```go
func factorial(n int) int {
    if n == 0 {
        return 1
    }
    return n * factorial(n - 1)
}

func main() {
    resultado := factorial(5)
    fmt.Println("Factorial:", resultado)
}
```

Salida esperada:

```text
Factorial: 120
```

## Notas importantes

- El lenguaje es case sensitive.
- Los identificadores pueden iniciar con letra o `_`.
- Los strings usan comillas dobles.
- Los rune usan comillas simples.
- Los bloques crean nuevos entornos.
- Las variables internas pueden ocultar variables externas.
- Los slices y structs se manejan por referencia.
- Los tipos primitivos se manejan por valor.

## Estado actual

El proyecto ya ejecuta las pruebas principales de la hoja de calificacion:

- Funcionalidades basicas
- Funcionalidades intermedias
- Funciones
- Slices
- Structs
- Reportes

La ultima correccion agregada fue el soporte para `i++` e `i--`, necesario para ejecutar correctamente ciclos clasicos como:

```go
for i := 0; i < cantidad; i++ {
    fmt.Println(i)
}
```
