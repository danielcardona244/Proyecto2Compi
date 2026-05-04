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

## Instalacion y ejecucion

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm start
```

URLs principales:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

## Regenerar parser

Si se modifica la gramatica:

```bash
cd backend
npm run parse
```

Esto actualiza:

```text
backend/src/grammar/parser.js
```

desde:

```text
backend/src/grammar/analizador.jison
```

## Funcionalidades implementadas

- Declaracion y asignacion de variables
- Operaciones aritmeticas, relacionales y logicas
- `fmt.Println`
- `nil`
- Punto y coma opcional
- `if`, `else if`, `else`
- `switch`, `case`, `default`
- `for` tipo while
- `for` clasico
- `for range`
- `break`, `continue`, `return`
- Funciones con y sin parametros
- Funciones recursivas
- Slices como parametro y retorno
- Structs y structs anidados
- `len`, `append`, `slices.Index`, `strings.Join`
- `strconv.Atoi`, `strconv.ParseFloat`, `reflect.TypeOf`
- Incremento y decremento con `i++` e `i--`

## Reportes

El IDE permite generar:

- Reporte de errores
- Tabla de simbolos
- Reporte AST en DOT y vista grafica
- Consola de ejecucion

## Entrada del programa

La ejecucion empieza desde:

```go
func main() {
    fmt.Println("Hola GoScript")
}
```

## Nota final

El README principal del repositorio esta en `README.md` en la raiz del proyecto. Este archivo queda como una version resumida dentro de `docs/`.
