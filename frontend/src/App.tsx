import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

function App() {
  const [code, setCode] = useState(`func main() {
  print("Hello, GoScript!")
}`);
  const [output, setOutput] = useState('');
  const [ast, setAst] = useState('');
  const [simbolos, setSimbolos] = useState<any[]>([]);

  const ejecutar = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/parser/analizar', { codigo: code });
      setOutput(response.data.salida);
      setSimbolos(response.data.simbolos);
    } catch (error: any) {
      setOutput(error.response?.data?.mensaje || 'Error al ejecutar');
    }
  };

  const generarAST = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/parser/ast', { codigo: code });
      setAst(response.data.ast);
    } catch (error: any) {
      setAst(error.response?.data?.mensaje || 'Error al generar AST');
    }
  };

  const generarSimbolos = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/parser/simbolos', { codigo: code });
      setSimbolos(response.data.simbolos);
    } catch (error: any) {
      setSimbolos([]);
      setOutput(error.response?.data?.mensaje || 'Error al generar símbolos');
    }
  };

  return (
    <div className="App">
      <h1>GoScript Interpreter</h1>
      <div className="ide-container">
        <div className="editor-section">
          <h2>Editor</h2>
          <Editor
            height="400px"
            language="go"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
          />
          <div className="buttons">
            <button onClick={ejecutar}>Ejecutar</button>
            <button onClick={generarAST}>Generar AST</button>
            <button onClick={generarSimbolos}>Generar Símbolos</button>
          </div>
        </div>
        <div className="output-section">
          <h2>Consola</h2>
          <textarea value={output} readOnly rows={10} />
        </div>
      </div>
      <div className="reports">
        <div className="ast-report">
          <h2>AST (DOT)</h2>
          <pre>{ast}</pre>
        </div>
        <div className="symbols-report">
          <h2>Tabla de Símbolos</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Línea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {simbolos.map((s, i) => (
                <tr key={i}>
                  <td>{s.id}</td>
                  <td>{s.tipo}</td>
                  <td>{s.valor}</td>
                  <td>{s.linea}</td>
                  <td>{s.columna}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;