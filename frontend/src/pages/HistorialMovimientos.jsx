import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarDrawer from '../components/SidebarDrawer';
import './HistorialMovimientos.css'; 
import { eliminarRegistro } from '../services/eliminar';
import { API_BASE } from '../Config'; 

const HistorialMovimientos = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estados para datos
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para Modal y Edición (tomado de DefinicionesSistema)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    cdTipoMov: '',
    hormas: '',
    kgs: '',
    obs: ''
  });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    tipo: '',
    producto: '',
    desde: '',
    hasta: '',
    cliente: '',
    ordenarPor: 'fecha_desc'
  });

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resMovs, resProd, resCli] = await Promise.all([
        fetch(`${API_BASE}/movimientos`, { headers: authHeaders() }),
        fetch(`${API_BASE}/productos`, { headers: authHeaders() }),
        fetch(`${API_BASE}/clientes`, { headers: authHeaders() })
      ]);

      if (resMovs.ok) setMovimientos(await resMovs.json());
      if (resProd.ok) setProductos(await resProd.json());
      if (resCli.ok) setClientes(await resCli.json());
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      producto: '',
      desde: '',
      hasta: '',
      cliente: '',
      ordenarPor: 'fecha_desc'
    });
  };

  // --- Lógica de Modal y Formulario (Similar a DefinicionesSistema) ---

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.cdTipoMov) {
      nuevosErrores.cdTipoMov = 'El tipo de movimiento es requerido';
    }
    const hormasVal = Number(formData.hormas);
    if (formData.hormas === '' || hormasVal < 0) {
      nuevosErrores.hormas = 'Las hormas deben ser 0 o mayores';
    }
    const kgsVal = Number(formData.kgs);
    if (formData.kgs === '' || kgsVal < 0) {
      nuevosErrores.kgs = 'Los kilogramos deben ser 0 o mayores';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAbrirModal = (movimiento = null) => {
    if (movimiento) {
      setEditando(movimiento.id);
      setFormData({
        cdTipoMov: movimiento.cdTipoMov ?? '',
        hormas: movimiento.hormas ?? '',
        kgs: movimiento.kgs ?? '',
        obs: movimiento.obs ?? ''
      });
    } else {
      setEditando(null);
      setFormData({
        cdTipoMov: '',
        hormas: '',
        kgs: '',
        obs: ''
      });
    }
    setErrores({});
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setEditando(null);
    setFormData({
      cdTipoMov: '',
      hormas: '',
      kgs: '',
      obs: ''
    });
    setErrores({});
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    const payload = {
      cdTipoMov: Number(formData.cdTipoMov),
      hormas: Number(formData.hormas),
      kgs: Number(formData.kgs),
      obs: formData.obs.trim()
    };

    try {
      const url = editando 
        ? `${API_BASE}/movimientos/${editando}` 
        : `${API_BASE}/movimientos`;
      
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editando ? '✓ Movimiento actualizado' : '✓ Movimiento creado');
        await cargarDatos();
        handleCerrarModal();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error: ${errData.mensaje || 'No se pudo guardar el movimiento'}`);
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    }
  };

  const handleEliminar = async (id, referencia) => {
    if (!window.confirm(`¿Eliminar el movimiento del lote/ID "${referencia}"?`)) return;
    debugger;
    const r = await eliminarRegistro('movimientos', id);
    if (r.ok) {
      await cargarDatos();
    } else {
      alert(r.mensaje || 'No se pudo eliminar el registro');
    }
  };

  // Funciones de mapeo para clases del CSS
  const getTipoMovimiento = (cdTipoMov) => {
    switch (Number(cdTipoMov)) {
      case 1: return { texto: 'INGRESO', clase: 'badge badge-ingreso' };
      case 2: return { texto: 'EGRESO', clase: 'badge badge-egreso' };
      case 3: return { texto: 'AJUSTE', clase: 'badge badge-ajuste' };
      case 4: return { texto: 'TRANSFERENCIA', clase: 'badge badge-transferencia' };
      default: return { texto: 'DESCONOCIDO', clase: 'badge' };
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const formatearFechaDisplay = (fechaISO) => {
    if (!fechaISO) return '';
    const [año, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${año}`;
  };

  // Filtrado local y ordenamiento
  const movimientosFiltrados = movimientos.filter(mov => {
    if (filtros.tipo && String(mov.cdTipoMov) !== filtros.tipo) return false;
    if (filtros.producto && String(mov.lote?.producto?.id) !== filtros.producto) return false;
    
    const clienteId = mov.cliente?.id || mov.remito?.cliente?.id;
    if (filtros.cliente && String(clienteId) !== filtros.cliente) return false;
    
    if (filtros.desde) {
      const fechaMov = new Date(mov.fechaAlta).getTime();
      const fechaDesde = new Date(filtros.desde).getTime();
      if (fechaMov < fechaDesde) return false;
    }
    
    if (filtros.hasta) {
      const fechaMov = new Date(mov.fechaAlta).getTime();
      const fechaHasta = new Date(filtros.hasta).getTime() + 86400000;
      if (fechaMov > fechaHasta) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const productoA = a.lote?.producto?.nombre || '';
    const productoB = b.lote?.producto?.nombre || '';
    const comparacionProducto = productoA.localeCompare(productoB, 'es', { sensitivity: 'base' });

    if (comparacionProducto !== 0) {
      return comparacionProducto;
    }

    const fechaA = new Date(a.fechaAlta).getTime();
    const fechaB = new Date(b.fechaAlta).getTime();

    if (filtros.ordenarPor === 'fecha_asc') {
      return fechaA - fechaB; 
    } else {
      return fechaB - fechaA; 
    }
  });

  return (
    <div className="historial-page">
      <SidebarDrawer
        abierto={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activeRoute="historial_movimientos"
      />

      {/* Navbar Superior */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>🧀</span> Alba Lana
        </div>
        <button onClick={() => setMenuAbierto(true)}>≡ Menú</button>
      </header>

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
        
        {/* Botones de navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
          <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
        </div>

        <div className="header-def" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#2e6b4d', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Historial de movimientos
          </h2>
        </div>

        {/* Card Filtros */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            Filtros
          </div>
          <div className="filtros-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            <div>
              <label style={labelStyle}>Tipo</label>
              <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange} style={inputStyle}>
                <option value="">Todos</option>
                <option value="1">Ingreso</option>
                <option value="2">Egreso</option>
                <option value="3">Ajuste</option>
                <option value="4">Transferencia</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Producto</label>
              <select name="producto" value={filtros.producto} onChange={handleFiltroChange} style={inputStyle}>
                <option value="">Todos</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Desde</label>
              <input type="date" name="desde" value={filtros.desde} onChange={handleFiltroChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Hasta</label>
              <input type="date" name="hasta" value={filtros.hasta} onChange={handleFiltroChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Cliente</label>
              <select name="cliente" value={filtros.cliente} onChange={handleFiltroChange} style={inputStyle}>
                <option value="">Todos</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Ordenar fecha (secundario)</label>
              <select name="ordenarPor" value={filtros.ordenarPor} onChange={handleFiltroChange} style={inputStyle}>
                <option value="fecha_desc">Fecha ↓ (Más reciente)</option>
                <option value="fecha_asc">Fecha ↑ (Más antiguo)</option>
              </select>
            </div>

          </div>
          
          <div style={{ padding: '0 20px 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={limpiarFiltros} style={btnStyleLight}>✕ Limpiar filtros</button>
          </div>
        </div>

        {/* Card Tabla */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            {movimientosFiltrados.length} movimiento(s)
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Fecha</th>
                  <th>Fecha Elaboracion</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Cámara</th>
                  <th>H</th>
                  <th>kg</th>
                  <th>Cliente</th>
                  <th>Operador</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>Cargando datos...</td></tr>
                ) : movimientosFiltrados.length === 0 ? (
                  <tr><td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>No hay movimientos registrados.</td></tr>
                ) : (
                  movimientosFiltrados.map((mov) => {
                    const tipo = getTipoMovimiento(mov.cdTipoMov);
                    const productoNombre = mov.lote?.producto?.nombre || '-';
                    const camaraNombre = mov.lote?.camara?.nombre || '-';
                    const clienteNombre = mov.cliente?.nombre || mov.remito?.cliente?.nombre || '-';
                    const operadorNombre = mov.operador?.nombre || mov.operador || mov.cdOperador || '-';
                    const observaciones = mov.obs || '-';

                    return (
                      <tr key={mov.id}>
                        <td>{mov.lote?.codigo || '-'}</td>
                        <td>{formatearFecha(mov.fechaAlta)}</td> 
                        <td>{formatearFechaDisplay(mov.lote?.fechaElaboracion)}</td>
                        <td>
                          <span className={tipo.clase}>{tipo.texto}</span>
                        </td>
                        <td><strong>{productoNombre}</strong></td>
                        <td>{camaraNombre}</td>
                        <td>{mov.hormas || 0}</td>
                        <td>{mov.kgs ? mov.kgs.toFixed(1) : '0.0'}</td>
                        <td>{clienteNombre}</td>
                        <td>{operadorNombre}</td>
                        <td>{observaciones}</td>
                      {mov.puedeOperar && (
    <td className="celda-acciones">
      <div className="acciones-wrap" style={{ display: 'flex', gap: '5px' }}>
        <button className="btn-accion btn-editar" onClick={() => handleAbrirModal(mov)} title="Editar" style={actionBtnStyle('#f39c12')}>✏️</button>
        <button className="btn-accion btn-eliminar" onClick={() => handleEliminar(mov.id, mov.lote?.codigo || mov.id)} title="Eliminar" style={actionBtnStyle('#e74c3c')}>🗑️</button>
      </div>
    </td>
  )}
                      </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* MODAL DE EDICIÓN (Replicado de DefinicionesSistema) */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>
                {editando ? '✏️ Editar movimiento' : '➕ Agregar movimiento'}
              </h3>
              <button className="btn-cerrar-modal" onClick={handleCerrarModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Tipo de Movimiento */}
              <div className="form-group-def" style={{ marginBottom: '15px' }}>
                <label htmlFor="cdTipoMov" style={labelStyle}>Tipo de Movimiento *</label>
                <select
                  id="cdTipoMov"
                  name="cdTipoMov"
                  value={formData.cdTipoMov}
                  onChange={handleInputChange}
                  style={inputStyle}
                  className={errores.cdTipoMov ? 'input-error' : ''}
                >
                  <option value="1">Ingreso</option>
                </select>
                {errores.cdTipoMov && (
                  <span className="error-msg" style={{ color: 'red', fontSize: '0.8rem' }}>{errores.cdTipoMov}</span>
                )}
              </div>

              {/* Hormas (H) */}
              <div className="form-group-def" style={{ marginBottom: '15px' }}>
                <label htmlFor="hormas" style={labelStyle}>Hormas (H) *</label>
                <input
                  type="number"
                  id="hormas"
                  name="hormas"
                  min="0"
                  value={formData.hormas}
                  onChange={handleInputChange}
                  placeholder="Ej: 10"
                  style={inputStyle}
                  className={errores.hormas ? 'input-error' : ''}
                />
                {errores.hormas && (
                  <span className="error-msg" style={{ color: 'red', fontSize: '0.8rem' }}>{errores.hormas}</span>
                )}
              </div>

              {/* Kilogramos (kg) */}
              <div className="form-group-def" style={{ marginBottom: '15px' }}>
                <label htmlFor="kgs" style={labelStyle}>Kilogramos (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  id="kgs"
                  name="kgs"
                  min="0"
                  value={formData.kgs}
                  onChange={handleInputChange}
                  placeholder="Ej: 45.5"
                  style={inputStyle}
                  className={errores.kgs ? 'input-error' : ''}
                />
                {errores.kgs && (
                  <span className="error-msg" style={{ color: 'red', fontSize: '0.8rem' }}>{errores.kgs}</span>
                )}
              </div>

              {/* Observaciones */}
              <div className="form-group-def" style={{ marginBottom: '15px' }}>
                <label htmlFor="obs" style={labelStyle}>Observaciones</label>
                <textarea
                  id="obs"
                  name="obs"
                  value={formData.obs}
                  onChange={handleInputChange}
                  placeholder="Detalles adicionales..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn-cancelar" onClick={handleCerrarModal} style={btnStyleLight}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={handleGuardar} style={{ backgroundColor: '#2e6b4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                {editando ? 'Actualizar' : 'Crear'} Movimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Estilos Auxiliares ---
const btnStyleLight = { backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '5px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const actionBtnStyle = (bgColor) => ({ backgroundColor: bgColor, border: 'none', color: 'white', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' });

export default HistorialMovimientos;