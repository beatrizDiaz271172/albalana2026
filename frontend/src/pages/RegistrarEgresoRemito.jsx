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
  const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
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

  // --- Autocomplete de Productos ---
  const [productoTexto, setProductoTexto] = useState('');
  const [mostrarSugerenciasProducto, setMostrarSugerenciasProducto] = useState(false);

  // --- Ítems ya agregados al remito ---
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // 1. useEffect inicial: Carga productos, operadores y clientes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProd, resOp, resCli] = await Promise.all([
          fetch(`${API_BASE}/productos`, { headers: authHeaders() }),
          fetch(`${API_BASE}/operadores`, { headers: authHeaders() }),
          fetch(`${API_BASE}/clientes`, { headers: authHeaders() }),
        ]);

        if (resProd.ok) setProductos(await resProd.json());
        if (resOp.ok) setOperadores(await resOp.json());
        if (resCli.ok) setClientes(await resCli.json());
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };

    cargarDatos();
  }, []);

  // 2. useEffect: Cargar cámaras según el Producto seleccionado
  useEffect(() => {
    const idProducto = itemActual.cdProducto;

    if (!idProducto) {
      setCamaras([]);
      setItemActual(prev => ({ ...prev, cdCamara: '', cdLote: '', hormas: 1, kgs: 0 }));
      return;
    }

    const cargarCamarasPorProducto = async () => {
      try {
        const res = await fetch(`${API_BASE}/camaras/producto/${idProducto}`, { 
          headers: authHeaders() 
        });
        if (res.ok) {
          const data = await res.json();
          const ordenados = data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
          setCamaras(ordenados);

          if (ordenados.length === 1) {
            setItemActual(prev => ({ ...prev, cdCamara: ordenados[0].id }));
          } else {
            setItemActual(prev => ({ ...prev, cdCamara: '' }));
          }
        }
      } catch (error) {
        console.error('Error al cargar cámaras por producto:', error);
      }
    };

    cargarCamarasPorProducto();
  }, [itemActual.cdProducto]);

  // 3. useEffect: Cargar lotes según Producto y Cámara seleccionados
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

  // --- Sugerencias de Productos filtradas por lo tipeado ---
  const sugerenciasProductos = useMemo(() => {
    if (!productoTexto) return [];
    const texto = productoTexto.toLowerCase();
    return productos.filter((p) => (p.nombre || '').toLowerCase().includes(texto)).slice(0, 8);
  }, [productoTexto, productos]);

  // --- Sugerencias de Clientes filtradas por lo tipeado ---
  const sugerenciasClientes = useMemo(() => {
    if (!clienteTexto) return [];
    const texto = clienteTexto.toLowerCase();
    return clientes.filter((c) => (c.nombre || '').toLowerCase().includes(texto)).slice(0, 8);
  }, [clienteTexto, clientes]);

  const handleSeleccionarProducto = (producto) => {
    setItemActual(prev => ({
      ...prev,
      cdProducto: producto.id,
      cdCamara: '',
      cdLote: '',
      hormas: 1,
      kgs: 0
    }));
    setProductoTexto(producto.nombre);
    setMostrarSugerenciasProducto(false);
  };

  const handleSeleccionarCliente = (cliente) => {
    setCdCliente(cliente.id);
    setClienteTexto(cliente.nombre);
    setMostrarSugerenciasCliente(false);
  };

  const handleChangeItem = (e) => {
    const { name, value, type } = e.target;
    setItemActual((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
      ...(name === 'cdCamara' ? { cdLote: '', hormas: 1, kgs: 0 } : {})
    }));
  };

  // --- Referencias, Objetos Seleccionados y Cálculo de Stock Restante ---
  const productoSeleccionado = productos.find((p) => String(p.id) === String(itemActual.cdProducto));
  const camaraSeleccionada = camaras.find((c) => String(c.id) === String(itemActual.cdCamara));
  const loteSeleccionado = lotes.find((l) => String(l.codigo) === String(itemActual.cdLote) || String(l.id) === String(itemActual.cdLote));
  
  // Variables para habilitar combos
  const camaraHabilitada = Boolean(itemActual.cdProducto);
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

  const ctKgsXHorma = loteSeleccionado ? Number(loteSeleccionado.kgsXHorma) : 0;
  const maxKgsRestantes = itemActual.hormas * ctKgsXHorma;

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

    if (loteSeleccionado && hormasIngresadas > maxHormasRestantes) {
      const msjAgregado = hormasYaAgregadas > 0 ? ` (ya tenés ${hormasYaAgregadas} agregadas en la lista)` : '';
      alert(`La cantidad de hormas ingresada (${hormasIngresadas}) supera el stock restante disponible para este lote que es: ${maxHormasRestantes}${msjAgregado}.`);
      return;
    }

    if (itemActual.kgs > maxKgsRestantes) {
      alert(`La cantidad de kgs ingresada (${kgsIngresados}) supera el máximo permitido: ${maxKgsRestantes.toFixed(2)} kg.`);
      return;
    }

    const nuevoItem = {
      id: Date.now(),
      cdProducto: itemActual.cdProducto,
      producto: productoSeleccionado?.nombre || '',
      cdCamara: itemActual.cdCamara,
      camara: camaraSeleccionada?.nombre || '',
      cdLote: loteFinal,
      hormas: hormasIngresadas,
      kgs: kgsIngresados
    };

    setItems([...items, nuevoItem]);

    // Limpiar formulario
    setItemActual({
      cdProducto: '',
      cdCamara: '',
      cdLote: '',
      loteManual: '',
      hormas: 1,
      kgs: 0
    });
    setProductoTexto('');
    setCamaras([]);
    setLotes([]);
  };

  const handleQuitarItem = (id) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cdOperador) {
      alert('Seleccioná un operador.');
      return;
    }

    if (!cdCliente) {
      alert('Seleccioná un cliente.');
      return;
    }

    if (items.length === 0) {
      alert('Agregá al menos un ítem al remito.');
      return;
    }

    setCargando(true);

    try {
      const payload = {
        fechaEgreso,
        cdOperador: parseInt(cdOperador),
        cdCliente: parseInt(cdCliente),
        observaciones,
        egresos: items.map((it) => ({
          cdProducto: parseInt(it.cdProducto),
          cdCamara: parseInt(it.cdCamara),
          cdLote: String(it.cdLote),
          hormas: Number(it.hormas),
          kgs: Number(it.kgs)
        }))
      };

      const res = await fetch(`${API_BASE}/remitos`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('✅ Remito guardado exitosamente.');
        navigate('/dashboard');
      } else {
        const error = await res.text();
        alert(`❌ Error al guardar: ${error}`);
      }
    } catch (error) {
      console.error('Error al guardar remito:', error);
      alert('❌ Error de conexión al guardar el remito.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="egreso-container">
      <nav className="navbar-egreso">
        <h1>📤 Registrar Egreso (Remito)</h1>
        <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>
      </nav>

      <main className="egreso-main">
        <form onSubmit={handleSubmit}>
          {/* Cabecera del remito */}
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
                  />
                </div>

                <div className="form-group-egreso">
                  <label htmlFor="cdOperador">Operador</label>
                  <select
                    id="cdOperador"
                    value={cdOperador}
                    onChange={(e) => setCdOperador(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {operadores.map((op) => (
                      <option key={op.id} value={op.id}>{op.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group-egreso">
                  <label htmlFor="clienteInput">Cliente</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="clienteInput"
                      placeholder="Escribe el nombre del cliente..."
                      value={clienteTexto}
                      onChange={(e) => {
                        setClienteTexto(e.target.value);
                        setCdCliente('');
                        setMostrarSugerenciasCliente(true);
                      }}
                      onFocus={() => setMostrarSugerenciasCliente(true)}
                      onBlur={() => setTimeout(() => setMostrarSugerenciasCliente(false), 150)}
                      autoComplete="off"
                    />
                    {mostrarSugerenciasCliente && sugerenciasClientes.length > 0 && (
                      <ul className="sugerencias-lista">
                        {sugerenciasClientes.map((c) => (
                          <li key={c.id} onMouseDown={() => handleSeleccionarCliente(c)}>
                            {c.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                    <label htmlFor="itemProductoInput">Producto</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="itemProductoInput"
                        placeholder="Escribe el nombre del producto..."
                        value={productoTexto}
                        onChange={(e) => {
                          setProductoTexto(e.target.value);
                          setItemActual(prev => ({ ...prev, cdProducto: '' }));
                          setMostrarSugerenciasProducto(true);
                        }}
                        onFocus={() => setMostrarSugerenciasProducto(true)}
                        onBlur={() => setTimeout(() => setMostrarSugerenciasProducto(false), 150)}
                        autoComplete="off"
                      />
                      {mostrarSugerenciasProducto && sugerenciasProductos.length > 0 && (
                        <ul className="sugerencias-lista">
                          {sugerenciasProductos.map((p) => (
                            <li key={p.id} onMouseDown={() => handleSeleccionarProducto(p)}>
                              {p.nombre}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="form-group-egreso">
                    <label htmlFor="itemCamara">Cámara</label>
                    <select
                      id="itemCamara"
                      name="cdCamara"
                      value={itemActual.cdCamara}
                      onChange={handleChangeItem}
                      disabled={!camaraHabilitada}
                    >
                      <option value="">
                        {camaraHabilitada ? '— Seleccionar —' : '— Seleccioná un producto primero —'}
                      </option>
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
                          {l.codigo} - Hormas: {l.hormas} - Kgs X Horma: {l.kgsXHorma}
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
                    {itemActual.hormas && itemActual.hormas > 0 && loteSeleccionado && (
                      <span style={{ fontSize: '0.85em', color: maxKgsRestantes === 0 ? '#d9534f' : '#666', marginLeft: '6px' }}>
                        (Disponible: {maxKgsRestantes.toFixed(2)} kg = {itemActual.hormas} hormas × {ctKgsXHorma} kg/horma)
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
                    disabled={!itemActual.hormas || itemActual.hormas <= 0}
                  />
                  {itemActual.kgs > maxKgsRestantes && (
                    <span className="ayuda-texto" style={{ color: '#d9534f' }}>
                      ❌ No podés cargar más de {maxKgsRestantes.toFixed(2)} kg
                    </span>
                  )}
                  {(!itemActual.hormas || itemActual.hormas <= 0) && (
                    <span className="ayuda-texto" style={{ color: '#d9534f' }}>
                      ⚠️ Cargá hormas primero para habilitar Kgs
                    </span>
                  )}
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
