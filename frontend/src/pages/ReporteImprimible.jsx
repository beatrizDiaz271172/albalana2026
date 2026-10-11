import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReporteImprimible.css';
import { API_BASE } from '../Config';

const authHeaders = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// Parseo manual de fechas ISO para evitar el desfase UTC-3 de new Date()
const fmtFecha = (iso) => {
  if (!iso || typeof iso !== 'string') return '-';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const fmtNum = (n, dec = 1) => Number(n || 0).toFixed(dec);

const TIPOS_MOV = {
  1: 'Ingreso',
  2: 'Egreso',
  3: 'Ajuste',
  4: 'Transferencia'
};

const NIVELES = { 1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Crítica' };

const SECCIONES = [
  { id: 'stockProducto', label: 'Stock por producto y cámara' },
  { id: 'stockLote', label: 'Detalle de stock por lote' },
  { id: 'alertas', label: 'Alertas activas' },
  { id: 'movimientos', label: 'Últimos movimientos' }
];

const ReporteImprimible = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [camaras, setCamaras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [seleccion, setSeleccion] = useState({
    stockProducto: true,
    stockLote: true,
    alertas: true,
    movimientos: true
  });
  const [limiteMov, setLimiteMov] = useState(30);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const urls = ['stock', 'camaras', 'productos', 'movimientos', 'movimientos/alertas'];
        const resp = await Promise.all(
          urls.map((u) => fetch(`${API_BASE}/${u}`, { headers: authHeaders() }))
        );
        if (resp.some((r) => !r.ok)) throw new Error('No se pudieron cargar todos los datos del reporte.');
        const [st, cam, prod, mov, ale] = await Promise.all(resp.map((r) => r.json()));
        setStocks(Array.isArray(st) ? st : []);
        setCamaras(Array.isArray(cam) ? cam.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')) : []);
        setProductos(Array.isArray(prod) ? prod : []);
        setMovimientos(Array.isArray(mov) ? mov : []);
        setAlertas(Array.isArray(ale) ? ale : []);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Error de conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Stock activo con lote y producto válidos
  const stocksActivos = useMemo(
    () => stocks.filter((s) => s.activo === true && s.lote && s.lote.activo !== false && s.lote.producto),
    [stocks]
  );

  const totales = useMemo(
    () => ({
      hormas: stocksActivos.reduce((a, s) => a + (s.hormas || 0), 0),
      kgs: stocksActivos.reduce((a, s) => a + (s.kgs || 0), 0),
      movimientos: movimientos.length,
      criticas: alertas.filter((a) => a.nivelAlerta === 4).length
    }),
    [stocksActivos, movimientos, alertas]
  );

  // Matriz producto x cámara
  const filasProducto = useMemo(() => {
    const map = {};
    productos.forEach((p) => {
      map[p.id] = { id: p.id, nombre: p.nombre, cams: {}, h: 0, kg: 0, min: p.stockMinimo };
    });
    stocksActivos.forEach((s) => {
      const p = s.lote.producto;
      const c = s.lote.camara;
      if (!c) return;
      if (!map[p.id]) map[p.id] = { id: p.id, nombre: p.nombre, cams: {}, h: 0, kg: 0, min: p.stockMinimo };
      const f = map[p.id];
      f.cams[c.id] = f.cams[c.id] || { h: 0, kg: 0 };
      f.cams[c.id].h += s.hormas || 0;
      f.cams[c.id].kg += s.kgs || 0;
      f.h += s.hormas || 0;
      f.kg += s.kgs || 0;
    });
    return Object.values(map).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  }, [productos, stocksActivos]);

  // Detalle por lote, ordenado por producto y luego lote
  const filasLote = useMemo(
    () =>
      stocksActivos
        .filter((s) => (s.hormas || 0) > 0)
        .sort(
          (a, b) =>
            (a.lote.producto.nombre || '').localeCompare(b.lote.producto.nombre || '') ||
            (a.lote.codigo || '').localeCompare(b.lote.codigo || '')
        ),
    [stocksActivos]
  );

  const alertasOrdenadas = useMemo(
    () =>
      [...alertas].sort(
        (a, b) =>
          (b.nivelAlerta || 0) - (a.nivelAlerta || 0) ||
          (a.productoNombre || '').localeCompare(b.productoNombre || '')
      ),
    [alertas]
  );

  const movimientosRecientes = useMemo(() => {
    const ordenados = [...movimientos].sort((a, b) =>
      String(b.fechaAlta || '').localeCompare(String(a.fechaAlta || ''))
    );
    return limiteMov === 0 ? ordenados : ordenados.slice(0, limiteMov);
  }, [movimientos, limiteMov]);

  const toggle = (id) => setSeleccion((p) => ({ ...p, [id]: !p[id] }));

  const generadoEl = new Date().toLocaleString('es-AR');

  return (
    <div className="rep-page">
      {/* Barra de acciones: no se imprime */}
      <header className="rep-toolbar rep-noprint">
        <div className="rep-toolbar-title">🧀 Alba Lana — Reporte para imprimir</div>
        <div className="rep-toolbar-actions">
          <button type="button" className="rep-btn rep-btn-ghost" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button type="button" className="rep-btn rep-btn-primary" onClick={() => window.print()} disabled={cargando}>
            🖨 Imprimir / Guardar PDF
          </button>
        </div>
      </header>

      {/* Selector de secciones: no se imprime */}
      <section className="rep-opciones rep-noprint">
        <strong>Qué incluir en el reporte</strong>
        <div className="rep-opciones-lista">
          {SECCIONES.map((s) => (
            <label key={s.id} className="rep-check">
              <input type="checkbox" checked={seleccion[s.id]} onChange={() => toggle(s.id)} />
              {s.label}
            </label>
          ))}
          {seleccion.movimientos && (
            <label className="rep-check">
              Cantidad de movimientos
              <select value={limiteMov} onChange={(e) => setLimiteMov(Number(e.target.value))}>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>Todos</option>
              </select>
            </label>
          )}
        </div>
      </section>

      <main className="rep-hoja">
        <header className="rep-encabezado">
          <div>
            <h1>Alba Lana</h1>
            <p>Reporte de stock y movimientos</p>
          </div>
          <p className="rep-fecha">Generado el {generadoEl}</p>
        </header>

        {cargando ? (
          <p className="rep-estado">Cargando datos del reporte...</p>
        ) : error ? (
          <p className="rep-estado rep-error">{error}</p>
        ) : (
          <>
            <section className="rep-resumen">
              <div>
                <strong>{fmtNum(totales.hormas, 1)}</strong>
                <span>Hormas en stock</span>
              </div>
              <div>
                <strong>{fmtNum(totales.kgs, 1)}</strong>
                <span>Kgs en stock</span>
              </div>
              <div>
                <strong>{totales.movimientos}</strong>
                <span>Movimientos activos</span>
              </div>
              <div className={totales.criticas > 0 ? 'rep-resumen-critico' : ''}>
                <strong>{totales.criticas}</strong>
                <span>Alertas críticas</span>
              </div>
            </section>

            {seleccion.stockProducto && (
              <section className="rep-seccion">
                <h2>Stock por producto y cámara</h2>
                <div className="rep-tabla-wrap">
                  <table className="rep-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        {camaras.map((c) => (
                          <th key={c.id} className="rep-num">{c.nombre}</th>
                        ))}
                        <th className="rep-num">Total H</th>
                        <th className="rep-num">Total kg</th>
                        <th className="rep-centro">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasProducto.map((f) => (
                        <tr key={f.id}>
                          <td className="rep-fuerte">{f.nombre}</td>
                          {camaras.map((c) => {
                            const d = f.cams[c.id];
                            return (
                              <td key={c.id} className="rep-num">
                                {d ? `${fmtNum(d.h, 1)} H / ${fmtNum(d.kg, 1)} kg` : '—'}
                              </td>
                            );
                          })}
                          <td className="rep-num rep-fuerte">{fmtNum(f.h, 1)}</td>
                          <td className="rep-num">{fmtNum(f.kg, 1)}</td>
                          <td className="rep-centro">
                            <span className={f.min > f.h ? 'rep-tag rep-tag-rojo' : 'rep-tag rep-tag-verde'}>
                              {f.min > f.h ? 'Bajo' : 'OK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="rep-fuerte">Total</td>
                        {camaras.map((c) => (
                          <td key={c.id} />
                        ))}
                        <td className="rep-num rep-fuerte">{fmtNum(totales.hormas, 1)}</td>
                        <td className="rep-num rep-fuerte">{fmtNum(totales.kgs, 1)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {seleccion.stockLote && (
              <section className="rep-seccion">
                <h2>Detalle de stock por lote</h2>
                <div className="rep-tabla-wrap">
                  <table className="rep-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Lote</th>
                        <th>Cámara</th>
                        <th>Elaboración</th>
                        <th className="rep-num">Hormas</th>
                        <th className="rep-num">Kgs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasLote.length === 0 ? (
                        <tr><td colSpan="6" className="rep-vacio">No hay lotes con stock.</td></tr>
                      ) : (
                        filasLote.map((s) => (
                          <tr key={s.id}>
                            <td className="rep-fuerte">{s.lote.producto.nombre}</td>
                            <td>{s.lote.codigo}</td>
                            <td>{s.lote.camara?.nombre || '-'}</td>
                            <td>{fmtFecha(s.lote.fechaElaboracion)}</td>
                            <td className="rep-num">{fmtNum(s.hormas, 2)}</td>
                            <td className="rep-num">{fmtNum(s.kgs, 2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {seleccion.alertas && (
              <section className="rep-seccion">
                <h2>Alertas activas ({alertasOrdenadas.length})</h2>
                {alertasOrdenadas.length === 0 ? (
                  <p className="rep-vacio">No hay alertas activas.</p>
                ) : (
                  <div className="rep-tabla-wrap">
                    <table className="rep-tabla">
                      <thead>
                        <tr>
                          <th>Nivel</th>
                          <th>Producto</th>
                          <th>Lote</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertasOrdenadas.map((a, i) => (
                          <tr key={`${a.productoId}-${a.tipoAlerta}-${i}`}>
                            <td>
                              <span className={`rep-tag rep-nivel-${a.nivelAlerta}`}>
                                {NIVELES[a.nivelAlerta] || '-'}
                              </span>
                            </td>
                            <td className="rep-fuerte">{a.productoNombre}</td>
                            <td>{a.loteNombre || '-'}</td>
                            <td>{a.mensajeAlerta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {seleccion.movimientos && (
              <section className="rep-seccion">
                <h2>
                  Últimos movimientos ({movimientosRecientes.length}
                  {limiteMov !== 0 ? ` de ${movimientos.length}` : ''})
                </h2>
                <div className="rep-tabla-wrap">
                  <table className="rep-tabla">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Producto</th>
                        <th>Lote</th>
                        <th>Cámara</th>
                        <th className="rep-num">H</th>
                        <th className="rep-num">Kg</th>
                        <th>Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosRecientes.length === 0 ? (
                        <tr><td colSpan="8" className="rep-vacio">No hay movimientos.</td></tr>
                      ) : (
                        movimientosRecientes.map((m) => (
                          <tr key={m.id}>
                            <td>{fmtFecha(m.fechaAlta)}</td>
                            <td>{TIPOS_MOV[m.cdTipoMov] || '-'}</td>
                            <td className="rep-fuerte">{m.lote?.producto?.nombre || '-'}</td>
                            <td>{m.lote?.codigo || '-'}</td>
                            <td>{m.lote?.camara?.nombre || '-'}</td>
                            <td className="rep-num">{fmtNum(m.hormas, 1)}</td>
                            <td className="rep-num">{fmtNum(m.kgs, 1)}</td>
                            <td>{m.remito?.cliente?.nombre || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReporteImprimible;
