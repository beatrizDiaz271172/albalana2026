import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrarEgresoRemito.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const RegistrarEgresoRemito = () => {
  const navigate = useNavigate();
  const hoy = new Date().toISOString().split('T')[0];

  // --- Datos de referencia (combos) ---
  const [productos, setProductos] = useState([]);
  const [camaras, setCamaras] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [clientes, setClientes] = useState([]);

  // --- Cabecera del remito ---
  const [fechaEgreso, setFechaEgreso] = useState(hoy);
  const [cdOperador, setCdOperador] = useState('');
  const [clienteTexto, setClienteTexto] = useState('');
  const [cdCliente, setCdCliente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // --- Formulario del ítem a agregar ---
  const [itemActual, setItemActual] = useState({
    cdProducto: '',
    cdCamara: '',
    cdLote: '',
    loteManual: '',
    hormas: 1,
    kgs: 0
  });

  // --- Ítems ya agregados al remito ---
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // 1. useEffect inicial (Carga productos, cámaras, operadores y clientes)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProd, resCam, resOp, resCli] = await Promise.all([
          fetch(`${API_BASE}/productos`, { headers: authHeaders() }),
          fetch(`${API_BASE}/camaras`, { headers: authHeaders() }),
          fetch(`${API_BASE}/operadores`, { headers: authHeaders() }),
          fetch(`${API_BASE}/clientes`, { headers: authHeaders() }),
        ]);

        if (resProd.ok) setProductos(await resProd.json());
        if (resCam.ok) setCamaras((await resCam.json()).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')));
        if (resOp.ok) setOperadores(await resOp.json());
        if (resCli.ok) setClientes(await resCli.json());
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };

    cargarDatos();
  }, []);

  // 2. useEffect secundario (Carga lotes según Producto y Cámara seleccionados)
  useEffect(() => {
    const idProducto = itemActual.cdProducto;
    const idCamara = itemActual.cdCamara;

    if (!idProducto || !idCamara) {
      setLotes([]);
      return;
    }

    const cargarLotesFiltrados = async () => {
      try {
        const res = await fetch(`${API_BASE}/lotes/${idProducto}/${idCamara}`, { 
          headers: authHeaders() 
        });
        if (res.ok) {
          const data = await res.json();
          setLotes(data.sort((a, b) => (a.codigo || '').localeCompare(b.codigo || '')));
        }
      } catch (error) {
        console.error('Error al cargar lotes filtrados:', error);
      }
    };

    cargarLotesFiltrados();
  }, [itemActual.cdProducto, itemActual.cdCamara]);

  // Sugerencias de cliente filtradas por lo tipeado
  const sugerenciasClientes = useMemo(() => {
    if (!clienteTexto) return [];
    const texto = clienteTexto.toLowerCase();
    return clientes.filter((c) => (c.nombre || '').toLowerCase().includes(texto)).slice(0, 8);
  }, [clienteTexto, clientes]);

  const handleSeleccionarCliente = (cliente) => {
    setCdCliente(cliente.id);
    setClienteTexto(cliente.nombre);
    setMostrarSugerencias(false);
  };

  const handleChangeItem = (e) => {
    const { name, value, type } = e.target;
    setItemActual((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // --- Referencias, Objetos Seleccionados y Cálculo de Stock Restante (Hormas y Kgs) ---
  const productoSeleccionado = productos.find((p) => String(p.id) === String(itemActual.cdProducto));
  const camaraSeleccionada = camaras.find((c) => String(c.id) === String(itemActual.cdCamara));
  const loteSeleccionado = lotes.find((l) => String(l.codigo) === String(itemActual.cdLote) || String(l.id) === String(itemActual.cdLote));
  const loteHabilitado = Boolean(itemActual.cdProducto && itemActual.cdCamara);

  // Suma de hormas y kgs agregados en la lista actual para este mismo Producto + Cámara + Lote
  const itemsFiltradosMisLote = items.filter(
    (it) =>
      String(it.cdProducto) === String(itemActual.cdProducto) &&
      String(it.cdCamara) === String(itemActual.cdCamara) &&
      String(it.cdLote) === String(itemActual.cdLote)
  );

  const hormasYaAgregadas = itemsFiltradosMisLote.reduce((acc, it) => acc + Number(it.hormas), 0);
  const kgsYaAgregados = itemsFiltradosMisLote.reduce((acc, it) => acc + Number(it.kgs), 0);

  // Disponibilidad en vivo para Hormas
  const maxHormasDisponibles = loteSeleccionado ? Number(loteSeleccionado.hormas) : 0;
  const maxHormasRestantes = Math.max(0, maxHormasDisponibles - hormasYaAgregadas);

  // Disponibilidad en vivo para Kgs
  //const maxKgsDisponibles = loteSeleccionado ? Number(loteSeleccionado.kgs) : 0;
  //const maxKgsRestantes = Math.max(0, maxKgsDisponibles - kgsYaAgregados);
  const ctKgsXHorma = loteSeleccionado ? Number(loteSeleccionado.kgsXHorma) : 0;
  const maxKgsRestantes = maxHormasRestantes * ctKgsXHorma;


  const handleAgregarItem = () => {
    const loteFinal = itemActual.loteManual?.trim() || itemActual.cdLote;

    if (!itemActual.cdProducto || !itemActual.cdCamara || !loteFinal) {
      alert('Completá producto, cámara y lote antes de agregar el ítem.');
      return;
    }

    const hormasIngresadas = Number(itemActual.hormas);
    const kgsIngresados = Number(itemActual.kgs);

    if (hormasIngresadas <= 0) {
      alert('La cantidad de hormas/cuñas debe ser mayor a 0.');
      return;
    }

    if (kgsIngresados < 0) {
      alert('La cantidad de kgs no puede ser menor a 0.');
      return;
    }

    // Validación contra el stock restante de HORMAS
    if (loteSeleccionado && hormasIngresadas > maxHormasRestantes) {
      const msjAgregado = hormasYaAgregadas > 0 ? ` (ya tenés ${hormasYaAgregadas} agregadas en la lista)` : '';
      alert(`La cantidad de hormas ingresada (${hormasIngresadas}) supera el stock restante disponible para este lote que es: ${maxHormasRestantes}${msjAgregado}.`);
      return;
    }

    // Validación contra el stock restante de KGS
    if (loteSeleccionado && kgsIngresados > maxKgsRestantes) {
      const msjAgregado = kgsYaAgregados > 0 ? ` (ya tenés ${kgsYaAgregados} kg agregados en la lista)` : '';
      alert(`La cantidad de kg ingresada (${kgsIngresados}) supera el stock restante disponible para este lote que es: ${maxKgsRestantes} kg${msjAgregado}.`);
      return;
    }

    const ctKgsPermitidos = ctKgsXHorma * hormasIngresadas;
    if (loteSeleccionado && kgsIngresados > ctKgsPermitidos) {
      alert(`La cantidad de Kilos ingresados(${kgsIngresados}) supera el maximo de kilos para la cantidad de hormas cargadas: ${hormasIngresadas}.`);
      return;
    }

    if (!itemActual.hormas && !itemActual.kgs) {
      alert('Ingresá hormas/cuñas o kgs para el ítem.');
      return;
    }

    const nuevoItem = {
      id: Date.now(),
      cdProducto: itemActual.cdProducto,
      producto: productoSeleccionado?.nombre || '',
      cdCamara: itemActual.cdCamara,
      camara: camaraSeleccionada?.nombre || '',
      cdLote: loteFinal,
      hormas: itemActual.hormas === '' ? 0 : Number(itemActual.hormas),
      kgs: itemActual.kgs === '' ? 0 : Number(itemActual.kgs)
    };

    setItems((prev) => [...prev, nuevoItem]);

    // Reset del subformulario de ítem
    setItemActual((prev) => ({
      ...prev,
      cdLote: '',
      loteManual: '',
      hormas: 1,
      kgs: 0
    }));
  };

  const handleQuitarItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Agregá al menos un ítem al remito antes de guardarlo.');
      return;
    }

    setCargando(true);

    const payload = {
      fechaEgreso,
      cdCliente: cdCliente || null,
      cdOperador: cdOperador || null,
      observaciones,
      items: items.map((it) => ({
        cdProducto: it.cdProducto,
        cdCamara: it.cdCamara,
        cdLote: it.cdLote,
        hormas: it.hormas,
        kgs: it.kgs
      }))
    };

    try {
      const response = await fetch(`${API_BASE}/remitos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('¡Remito de egreso registrado con éxito!');
        navigate('/dashboard');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al registrar el remito: ${errData.mensaje || 'Ocurrió un error inesperado'}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="egreso-page">
      {/* Navbar Superior */}
      <header className="navbar-egreso">
        <div className="navbar-brand-egreso">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu-egreso">≡ Menú</button>
      </header>

      <main className="egreso-container">
        <div className="nav-actions-egreso">
          <button className="btn-nav-top-egreso" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button className="btn-nav-top-egreso" onClick={() => navigate(-1)}>
            ↰ Volver
          </button>
        </div>

        <h2 className="screen-title-egreso">
          <span className="title-icon">📤</span> Registrar egreso — Remito
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Datos del remito */}
          <div className="card-egreso">
            <div className="card-header-egreso">Datos del remito</div>
            <div className="card-body-egreso">
              <div className="grid-2">
                <div className="form-group-egreso">
                  <label htmlFor="fechaEgreso">Fecha del egreso</label>
                  <input
                    type="date"
                    id="fechaEgreso"
                    value={fechaEgreso}
                    onChange={(e) => setFechaEgreso(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-egreso">
                  <label htmlFor="cdOperador">Operario</label>
                  <select
                    id="cdOperador"
                    value={cdOperador}
                    required
                    onChange={(e) => setCdOperador(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {operadores.map((op) => (
                      <option key={op.id} value={op.id}>{op.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-egreso" style={{ position: 'relative' }}>
                <label htmlFor="cliente">Cliente</label>
                <input
                  type="text"
                  id="cliente"
                  required
                  placeholder="Escribí para filtrar..."
                  value={clienteTexto}
                  onChange={(e) => {
                    setClienteTexto(e.target.value);
                    setCdCliente('');
                    setMostrarSugerencias(true);
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                  autoComplete="off"
                />
                {mostrarSugerencias && sugerenciasClientes.length > 0 && (
                  <ul className="sugerencias-lista">
                    {sugerenciasClientes.map((c) => (
                      <li key={c.id} onMouseDown={() => handleSeleccionarCliente(c)}>
                        {c.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group-egreso">
                <label htmlFor="observaciones">Observaciones del remito</label>
                <textarea
                  id="observaciones"
                  rows="3"
                  placeholder="Opcional"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ítems del remito */}
          <div className="card-egreso">
            <div className="card-header-egreso">Ítems del remito</div>
            <div className="card-body-egreso">
              {items.length === 0 ? (
                <p className="sin-items">Sin ítems aún</p>
              ) : (
                <table className="tabla-items">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cámara</th>
                      <th>Lote</th>
                      <th>Hormas/Cuñas</th>
                      <th>Kgs</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.producto}</td>
                        <td>{it.camara}</td>
                        <td>{it.cdLote}</td>
                        <td>{it.hormas}</td>
                        <td>{it.kgs}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-quitar-item"
                            onClick={() => handleQuitarItem(it.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="agregar-item-box">
                <div className="agregar-item-titulo">Agregar ítem</div>

                <div className="grid-2">
                  <div className="form-group-egreso">
                    <label htmlFor="itemProducto">Producto</label>
                    <select
                      id="itemProducto"
                      name="cdProducto"
                      value={itemActual.cdProducto}
                      onChange={handleChangeItem}
                    >
                      <option value="">— Seleccionar —</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-egreso">
                    <label htmlFor="itemCamara">Cámara</label>
                    <select
                      id="itemCamara"
                      name="cdCamara"
                      value={itemActual.cdCamara}
                      onChange={handleChangeItem}
                    >
                      <option value="">— Seleccionar —</option>
                      {camaras.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group-egreso">
                    <label htmlFor="itemLote">Lote</label>
                    <select
                      id="itemLote"
                      name="cdLote"
                      value={itemActual.cdLote}
                      onChange={handleChangeItem}
                      disabled={!loteHabilitado}
                    >
                      <option value="">
                        {loteHabilitado ? '— Seleccionar —' : '— Seleccioná producto y cámara primero —'}
                      </option>
                      {lotes.map((l) => (
                        <option key={l.id} value={l.codigo}>
                          {l.codigo} - Hormas: {l.hormas} - Kgs: {l.kgs}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-egreso">
                    <label htmlFor="itemHormas">
                      Hormas / Cuñas
                      {loteSeleccionado && (
                        <span style={{ fontSize: '0.85em', color: maxHormasRestantes === 0 ? '#d9534f' : '#666', marginLeft: '6px' }}>
                          (Disponible: {maxHormasRestantes})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      id="itemHormas"
                      name="hormas"
                      step="0.01"
                      min="0.01"
                      max={loteSeleccionado ? maxHormasRestantes : undefined}
                      value={itemActual.hormas}
                      onChange={handleChangeItem}
                    />
                    <span className="ayuda-texto">Horma entera = 1 · Media horma = 0.5 · Cuña pequeña = 0.25</span>
                  </div>
                </div>

                <div className="form-group-egreso">
                  <label htmlFor="itemKgs">
                    Kgs
                    {loteSeleccionado && (
                      <span style={{ fontSize: '0.85em', color: maxKgsRestantes === 0 ? '#d9534f' : '#666', marginLeft: '6px' }}>
                        (Disponible: {maxKgsRestantes} kg)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="itemKgs"
                    name="kgs"
                    step="0.01"
                    min="0"
                    max={loteSeleccionado ? maxKgsRestantes : undefined}
                    value={itemActual.kgs}
                    onChange={handleChangeItem}
                  />
                </div>

                <button type="button" className="btn-agregar-item" onClick={handleAgregarItem}>
                  + Agregar al remito
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit-egreso" disabled={cargando}>
            📤 {cargando ? 'Guardando...' : 'Guardar remito'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RegistrarEgresoRemito;