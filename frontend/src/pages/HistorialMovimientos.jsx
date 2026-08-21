import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistorialMovimientos.css'; 

const API_BASE = 'http://192.168.0.32:8081/api'; 

const HistorialMovimientos = () => {
  const navigate = useNavigate();

  // Estados para datos
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

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
  useEffect(() => {
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
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Filtrado local y ordenamiento: 1º por nombre de producto, 2º por fechaAlta
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
    // 1. Criterio Principal: Nombre de Producto (Alfabético)
    const productoA = a.lote?.producto?.nombre || '';
    const productoB = b.lote?.producto?.nombre || '';
    const comparacionProducto = productoA.localeCompare(productoB, 'es', { sensitivity: 'base' });

    if (comparacionProducto !== 0) {
      return comparacionProducto;
    }

    // 2. Criterio Secundario: FechaAlta (según el selector de orden)
    const fechaA = new Date(a.fechaAlta).getTime();
    const fechaB = new Date(b.fechaAlta).getTime();

    if (filtros.ordenarPor === 'fecha_asc') {
      return fechaA - fechaB; // Más antiguo a más reciente
    } else {
      return fechaB - fechaA; // Más reciente a más antiguo (por defecto)
    }
  });

  return (
    <div className="historial-page">
      
      {/* Navbar Superior */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>🧀</span> Alba Lana
        </div>
        <button>≡ Menú</button>
      </header>

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
        
        {/* Botones de navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
          <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
        </div>

        <h2 style={{ color: '#2e6b4d', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📋 Historial de movimientos
        </h2>

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>Cargando datos...</td></tr>
                ) : movimientosFiltrados.length === 0 ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No hay movimientos registrados.</td></tr>
                ) : (
                  movimientosFiltrados.map((mov) => {
                    const tipo = getTipoMovimiento(mov.cdTipoMov);
                    const productoNombre = mov.lote?.producto?.nombre || '-';
                    const camaraNombre = mov.lote?.camara?.nombre || '-';
                    const clienteNombre = mov.cliente?.nombre || mov.remito?.cliente?.nombre || '-';
                    const operadorNombre = mov.operador?.nombre || mov.operador || mov.cdOperador || '-';

                    return (
                      <tr key={mov.id}>
                        <td>{mov.lote?.codigo || '-'}</td>
                        <td>{formatearFecha(mov.fechaAlta)}</td>
                        <td>{formatearFecha(mov.fechaEditado)}</td>
                        <td>
                          <span className={tipo.clase}>{tipo.texto}</span>
                        </td>
                        <td><strong>{productoNombre}</strong></td>
                        <td>{camaraNombre}</td>
                        <td>{mov.hormas || 0}</td>
                        <td>{mov.kgs ? mov.kgs.toFixed(1) : '0.0'}</td>
                        <td>{clienteNombre}</td>
                        <td>{operadorNombre}</td>
                        <td>
                          <button style={actionBtnStyle('#4caf50')} title="Editar">✏️</button>
                          <button style={actionBtnStyle('#f44336')} title="Eliminar">❌</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

// --- Estilos Inline ---
const btnStyleLight = { backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '5px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const actionBtnStyle = (bgColor) => ({ backgroundColor: bgColor, border: 'none', color: 'white', padding: '5px 8px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' });

export default HistorialMovimientos;