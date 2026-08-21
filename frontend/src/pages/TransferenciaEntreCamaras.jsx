import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrarIngreso'; 
const API_BASE = 'http://192.168.0.32:8081/api';

const TransferenciaEntreCamaras = () => {
  const navigate = useNavigate();

  // Fecha actual por defecto en formato ISO (YYYY-MM-DD)
  const hoy = new Date().toISOString().split('T')[0];

  const [camaras, setCamaras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [camarasDestino, setCamarasDestino] = useState([]);

  const [formData, setFormData] = useState({
    cdTipoMov: 4, // Representa el tipo de movimiento TRANSFERENCIA=4
    fechaTransferencia: hoy,
    cdProducto: '',
    cdCamara: '',
    cdCamaraDestino: '',
    cdLote: '',
    cdOperador: '',
    hormas: 0.0,
    kgs: 0.0,
    observaciones: ''
  });

  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // 1. useEffect inicial - Obtener cámaras, productos y operadores
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [resCam, resProd, resOp] = await Promise.all([
          fetch(API_BASE + '/camaras', { headers: authHeaders() }),
          fetch(API_BASE + '/productos', { headers: authHeaders() }),
          fetch(API_BASE + '/operadores', { headers: authHeaders() })
        ]);

        if (resCam.ok) {
          const data = await resCam.json();
          const ordenados = data.sort((a, b) => 
            (a.nombre || '').localeCompare(b.nombre || '')
          );
          setCamaras(ordenados);
        }

        if (resProd.ok) {
          const data = await resProd.json();
          setProductos(data);
        }

        if (resOp.ok) {
          const data = await resOp.json();
          setOperadores(data);
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };

    obtenerDatos();
  }, []);

  // 2. useEffect - Cargar lotes filtrados según Producto y Cámara Origen seleccionados
  useEffect(() => {
    const idProducto = formData.cdProducto;
    const idCamaraOrigen = formData.cdCamara;

    // Si no están ambos seleccionados, limpiar lotes
    if (!idProducto || !idCamaraOrigen) {
      setLotes([]);
      setLoteSeleccionado(null);
      setFormData(prev => ({ ...prev, cdLote: '' }));
      return;
    }

    const cargarLotesFiltrados = async () => {
      try {
        const res = await fetch(`${API_BASE}/lotes/${idProducto}/${idCamaraOrigen}`, { 
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
  }, [formData.cdProducto, formData.cdCamara]);

  // 3. useEffect - Cargar cámaras destino (todas excepto la origen)
  useEffect(() => {
    const idProducto = formData.cdProducto;
    const idCamaraOrigen = formData.cdCamara;

    if (!idProducto || !idCamaraOrigen) {
      setCamarasDestino([]);
      // Evitamos sobrescribir innecesariamente si ya está vacío
      if (formData.cdCamaraDestino !== '') {
        setFormData(prev => ({ ...prev, cdCamaraDestino: '' }));
      }
      return;
    }

    const filtradas = camaras.filter(cam => String(cam.id) !== String(idCamaraOrigen));
    setCamarasDestino(filtradas);
    
  }, [formData.cdProducto, formData.cdCamara, camaras]);

  // Variables para habilitar/deshabilitar combos
  const loteHabilitado = Boolean(formData.cdProducto && formData.cdCamara);
  const camaraDestinoHabilitado = Boolean(formData.cdProducto && formData.cdCamara);

  // Obtener máximos permitidos del lote seleccionado
  const obtenerMaximos = () => {
    if (!formData.cdLote || !lotes) return { hormas: null, kgs: null, kgsXHorma: null };
    
    const lote = lotes.find(l => l.codigo === formData.cdLote);
    if (lote) {
      return {
        hormas: lote.hormas || null,
        kgs: (lote.hormas * lote.kgsXHorma) || null,
        kgsXHorma: lote.kgsXHorma || null
      };
    }
    return { hormas: null, kgs: null, kgsXHorma: null };
  };

  const maximos = obtenerMaximos();
  
  // NUEVO: Calculamos los Kgs máximos permitidos según las hormas ingresadas en el input
  const maxKgsCalculado = (formData.hormas && maximos.kgsXHorma) 
    ? formData.hormas * maximos.kgsXHorma 
    : 0;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setErroresValidacion(prev => ({ ...prev, [name]: '' }));

    let newValue = value;
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      // Resetear campos dependientes
      ...(name === 'cdProducto' || name === 'cdCamara' ? { cdLote: '', cdCamaraDestino: '' } : {}),
      ...(name === 'cdCamara' ? { cdCamaraDestino: '' } : {})
    }));

    // Si se selecciona un lote, obtener sus datos
    if (name === 'cdLote') {
      const lote = lotes.find(l => l.codigo === value);
      setLoteSeleccionado(lote || null);
    }
  };

  const validarFormulario = () => {
    const errores = {};

    if (!formData.cdProducto) errores.cdProducto = 'Debe seleccionar un producto';
    if (!formData.cdCamara) errores.cdCamara = 'Debe seleccionar cámara origen';
    if (!formData.cdCamaraDestino) errores.cdCamaraDestino = 'Debe seleccionar cámara destino';
    if (!formData.cdLote) errores.cdLote = 'Debe seleccionar un lote';
    if (!formData.cdOperador) errores.cdOperador = 'Debe seleccionar un operario';
    
    // Validación de Hormas
    if (formData.hormas === '' || formData.hormas === null) {
      errores.hormas = 'Las hormas son requeridas';
    } else if (maximos.hormas !== null && formData.hormas > maximos.hormas) {
      errores.hormas = `No puede transferir más de ${maximos.hormas} hormas (disponibles en el lote)`;
    } else if (formData.hormas <= 0) {
      errores.hormas = 'Las hormas deben ser mayor a 0';
    }
    
    // Validación de Kgs (CORREGIDA)
    if (formData.kgs === '' || formData.kgs === null) {
      errores.kgs = 'Los Kgs son requeridos';
    } else if (maxKgsCalculado > 0 && formData.kgs > maxKgsCalculado) {
      errores.kgs = `No puede transferir más de ${maxKgsCalculado.toFixed(2)} kgs (calculado por hormas)`;
    } else if (formData.kgs <= 0) {
      errores.kgs = 'Los Kgs deben ser mayor a 0';
    }

    if (!formData.observaciones.trim()) {
      errores.observaciones = 'Las observaciones son requeridas';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      alert('Por favor, corrija los errores en el formulario');
      return;
    }

    setCargando(true);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(API_BASE + '/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Transferencia entre cámaras registrada con éxito!');
        navigate('/dashboard');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al registrar la transferencia: ${errData.mensaje || 'Ocurrió un error inesperado'}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="ingreso-page">
      {/* Navbar Superior */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu">≡ Menú</button>
      </header>

      {/* Contenido principal */}
      <main className="ingreso-container">
        {/* Navegación superior */}
        <div className="nav-actions">
          <button className="btn-nav-top" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button className="btn-nav-top" onClick={() => navigate(-1)}>
            ↰ Volver
          </button>
        </div>

        {/* Título principal */}
        <h2 className="screen-title">
          <span className="title-icon">↔️</span> Transferencia entre cámaras
        </h2>

        {/* Card Formulario */}
        <div className="form-card">
          <div className="form-card-header" style={{ backgroundColor: '#2e6b4d', color: 'white' }}>
            Registrar movimiento de producto entre cámaras
          </div>
          
          <div style={{ padding: '15px 20px', color: '#555', fontSize: '0.95rem' }}>
            Transfiere producto desde una cámara origen a una cámara destino.
          </div>

          <form onSubmit={handleSubmit} className="ingreso-form">
            <div className="form-grid">
              
              {/* Fecha de transferencia */}
              <div className="form-group">
                <label htmlFor="fechaTransferencia">Fecha</label>
                <input
                  type="date"
                  id="fechaTransferencia"
                  name="fechaTransferencia"
                  value={formData.fechaTransferencia}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Producto */}
              <div className="form-group">
                <label htmlFor="cdProducto">Producto</label>
                <select
                  id="cdProducto"
                  name="cdProducto"
                  value={formData.cdProducto}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {productos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {erroresValidacion.cdProducto && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.cdProducto}
                  </span>
                )}
              </div>

              {/* Cámara ORIGEN (IZQUIERDA) */}
              <div className="form-group">
                <label htmlFor="cdCamara">Cámara ORIGEN</label>
                <select
                  id="cdCamara"
                  name="cdCamara"
                  value={formData.cdCamara}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {camaras.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {erroresValidacion.cdCamara && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.cdCamara}
                  </span>
                )}
              </div>

              {/* Cámara DESTINO (DERECHA) */}
              <div className="form-group">
                <label htmlFor="cdCamaraDestino">Cámara DESTINO</label>
                <select
                  id="cdCamaraDestino"
                  name="cdCamaraDestino"
                  value={formData.cdCamaraDestino}
                  onChange={handleChange}
                  disabled={!camaraDestinoHabilitado}
                  required
                >
                  <option value="">
                    {camaraDestinoHabilitado ? '— Seleccionar —' : '— Seleccioná producto y cámara origen primero —'}
                  </option>
                  {camarasDestino.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {erroresValidacion.cdCamaraDestino && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.cdCamaraDestino}
                  </span>
                )}
              </div>

              {/* Lote */}
              <div className="form-group">
                <label htmlFor="cdLote">Lote</label>
                <select
                  id="cdLote"
                  name="cdLote"
                  value={formData.cdLote}
                  onChange={handleChange}
                  disabled={!loteHabilitado}
                  required
                >
                  <option value="">
                    {loteHabilitado ? '— Seleccionar —' : '— Seleccioná producto y cámara primero —'}
                  </option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.codigo}>
                      {lote.codigo} - Hormas: {lote.hormas} - Kgs X Horma: {lote.kgsXHorma}
                    </option>
                  ))}
                </select>
                {erroresValidacion.cdLote && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.cdLote}
                  </span>
                )}
              </div>

              {/* Operario / Operador */}
              <div className="form-group">
                <label htmlFor="cdOperador">Operario</label>
                <select
                  id="cdOperador"
                  name="cdOperador"
                  value={formData.cdOperador}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre}
                    </option>
                  ))}
                </select>
                {erroresValidacion.cdOperador && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.cdOperador}
                  </span>
                )}
              </div>

              {/* Hormas a transferir */}
              <div className="form-group">
                <label htmlFor="hormas">
                  Hormas
                  {maximos.hormas !== null && (
                    <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '5px' }}>
                      (Máx: {maximos.hormas})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="hormas"
                  name="hormas"
                  min="0"
                  max={maximos.hormas || undefined}
                  value={formData.hormas}
                  onChange={handleChange}
                  placeholder="Ingrese cantidad"
                  required
                />
                {erroresValidacion.hormas && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.hormas}
                  </span>
                )}
              </div>

              {/* Kgs a transferir (CORREGIDO) */}
              <div className="form-group">
                <label htmlFor="kgs">
                  Kgs
                  {maxKgsCalculado > 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '5px' }}>
                      (Disponible: {maxKgsCalculado.toFixed(2)})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="kgs"
                  name="kgs"
                  min="0"
                  max={maxKgsCalculado || undefined}
                  value={formData.kgs}
                  onChange={handleChange}
                  placeholder="Ingrese cantidad"
                  disabled={!formData.hormas || formData.hormas <= 0}
                  required
                />
                {erroresValidacion.kgs && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.kgs}
                  </span>
                )}
              </div>

              {/* Observaciones */}
              <div className="form-group full-width">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  placeholder="Ej: Transferencia por reembalaje"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
                {erroresValidacion.observaciones && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                    {erroresValidacion.observaciones}
                  </span>
                )}
              </div>

            </div>

            <button 
              type="submit" 
              className="btn-submit-ingreso" 
              style={{ backgroundColor: '#f09c5a', color: 'white', borderColor: '#e68a44' }} 
              disabled={cargando}
            >
              ↔️ {cargando ? 'Registrando...' : 'Registrar transferencia'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TransferenciaEntreCamaras;