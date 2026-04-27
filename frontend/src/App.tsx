import React, { ChangeEvent, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

type Archivo = {
  id: number;
  nombre: string;
  codigo: string;
};

type SimboloReporte = {
  id: string;
  tipoSimbolo?: string;
  tipo: string;
  ambito?: string;
  linea: number;
  columna: number;
};

type ErrorReporte = {
  descripcion: string;
  linea: number;
  columna: number;
  tipo: string;
};

const ejemplo = `func main() {
  var nums []int = []int{1, 2, 3}
  fmt.Println("len", len(nums))
}`;
const API_BASE = 'http://localhost:8000/api/parser';

function App() {
  const [archivos, setArchivos] = useState<Archivo[]>([{ id: 1, nombre: 'main.gst', codigo: ejemplo }]);
  const [activoId, setActivoId] = useState(1);
  const [salida, setSalida] = useState('');
  const [ast, setAst] = useState('');
  const [simbolos, setSimbolos] = useState<SimboloReporte[]>([]);
  const [errores, setErrores] = useState<ErrorReporte[]>([]);
  const [reporteActivo, setReporteActivo] = useState<'ast' | 'simbolos' | 'errores'>('errores');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const archivoActivo = useMemo(
    () => archivos.find((archivo) => archivo.id === activoId) || archivos[0] || { id: 0, nombre: 'main.gst', codigo: '' },
    [archivos, activoId]
  );

  const actualizarCodigo = (codigo: string) => {
    setArchivos((actuales) =>
      actuales.map((archivo) => archivo.id === activoId ? { ...archivo, codigo } : archivo)
    );
  };

  const nuevoArchivo = () => {
    const id = Date.now();
    setArchivos((actuales) => [...actuales, { id, nombre: `archivo${actuales.length + 1}.gst`, codigo: '' }]);
    setActivoId(id);
  };

  const abrirArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const codigo = await file.text();
    const id = Date.now();
    setArchivos((actuales) => [...actuales, { id, nombre: file.name, codigo }]);
    setActivoId(id);
    event.target.value = '';
  };

  const guardarArchivo = () => {
    const blob = new Blob([archivoActivo.codigo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivoActivo.nombre.endsWith('.gst') ? archivoActivo.nombre : `${archivoActivo.nombre}.gst`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const ejecutar = async () => {
    try {
      const response = await axios.post(`${API_BASE}/analizar`, { codigo: archivoActivo.codigo });
      setSalida(response.data.salida || '');
      setSimbolos(response.data.simbolos || []);
      setErrores(response.data.errores || []);
      setReporteActivo((response.data.errores || []).length > 0 ? 'errores' : 'simbolos');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al ejecutar';
      setSalida(mensaje);
      setErrores([{ descripcion: mensaje, linea: 0, columna: 0, tipo: 'Sintactico' }]);
      setReporteActivo('errores');
    }
  };

  const generarAST = async () => {
    try {
      const response = await axios.post(`${API_BASE}/ast`, { codigo: archivoActivo.codigo });
      setAst(response.data.ast || '');
      setReporteActivo('ast');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al generar AST';
      setErrores([{ descripcion: mensaje, linea: 0, columna: 0, tipo: 'Sintactico' }]);
      setReporteActivo('errores');
    }
  };

  const generarSimbolos = async () => {
    try {
      const response = await axios.post(`${API_BASE}/simbolos`, { codigo: archivoActivo.codigo });
      setSimbolos(response.data.simbolos || []);
      setReporteActivo('simbolos');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al generar simbolos';
      setErrores([{ descripcion: mensaje, linea: 0, columna: 0, tipo: 'Sintactico' }]);
      setReporteActivo('errores');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>GoScript IDE</h1>
        <div className="toolbar">
          <button onClick={ejecutar}>Ejecutar</button>
          <button onClick={nuevoArchivo}>Nuevo archivo</button>
          <button onClick={() => fileInputRef.current?.click()}>Abrir .gst</button>
          <button onClick={guardarArchivo}>Guardar .gst</button>
          <input ref={fileInputRef} className="hidden-input" type="file" accept=".gst,.txt" onChange={abrirArchivo} />
        </div>
      </header>

      <section className="workspace">
        <div className="editor-panel">
          <div className="file-tabs">
            {archivos.map((archivo) => (
              <button
                key={archivo.id}
                className={archivo.id === activoId ? 'file-tab active' : 'file-tab'}
                onClick={() => setActivoId(archivo.id)}
              >
                {archivo.nombre}
              </button>
            ))}
          </div>
          <Editor
            height="520px"
            language="go"
            value={archivoActivo.codigo}
            onChange={(value) => actualizarCodigo(value || '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: 'on' }}
          />
        </div>

        <aside className="console-panel">
          <h2>Consola</h2>
          <pre className="console-output">{salida || 'Sin salida.'}</pre>
        </aside>
      </section>

      <section className="reports-panel">
        <nav className="report-tabs">
          <button className={reporteActivo === 'ast' ? 'active' : ''} onClick={generarAST}>Reporte AST</button>
          <button className={reporteActivo === 'simbolos' ? 'active' : ''} onClick={generarSimbolos}>Tabla de Simbolos</button>
          <button className={reporteActivo === 'errores' ? 'active' : ''} onClick={() => setReporteActivo('errores')}>Reporte de Errores</button>
        </nav>

        {reporteActivo === 'ast' && <pre className="dot-output">{ast || 'Genera el AST para ver el DOT.'}</pre>}

        {reporteActivo === 'simbolos' && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo simbolo</th>
                <th>Tipo dato</th>
                <th>Ambito</th>
                <th>Linea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {simbolos.map((s, i) => (
                <tr key={`${s.id}-${i}`}>
                  <td>{s.id}</td>
                  <td>{s.tipoSimbolo || 'Variable'}</td>
                  <td>{s.tipo}</td>
                  <td>{s.ambito || 'Global'}</td>
                  <td>{s.linea}</td>
                  <td>{s.columna}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reporteActivo === 'errores' && (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Descripcion</th>
                <th>Linea</th>
                <th>Columna</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {errores.map((error, i) => (
                <tr key={`${error.descripcion}-${i}`}>
                  <td>{i + 1}</td>
                  <td>{error.descripcion}</td>
                  <td>{error.linea}</td>
                  <td>{error.columna}</td>
                  <td>{error.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;
