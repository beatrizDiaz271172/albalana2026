import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RemitoCliente.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const RemitoCliente = () => {
  const navigate = useNavigate();

  const [remitos, setRemitos] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [remitosConDetalles, setRemitosConDetalles] = useState([]);

  // Estados para los filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // 1. Cargar datos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [resRemitos, resOperadores, resMovimientos, resClientes] = await Promise.all([
          fetch(`${API_BASE}/remitos`, { headers: authHeaders() }),
          fetch(`${API_BASE}/operadores`, { headers: authHeaders() }),
          fetch(`${API_BASE}/movimientos`, { headers: authHeaders() }),
          fetch(`${API_BASE}/clientes`, { headers: authHeaders() })
        ]);

        if (resRemitos.ok) {
          const dataRemitos = await resRemitos.json();
          setRemitos(Array.isArray(dataRemitos) ? dataRemitos : []);
        }

        if (resOperadores.ok) {
          const dataOperadores = await resOperadores.json();
          setOperadores(Array.isArray(dataOperadores) ? dataOperadores : []);
        }

        if (resMovimientos.ok) {
          const dataMovimientos = await resMovimientos.json();
          setMovimientos(Array.isArray(dataMovimientos) ? dataMovimientos : []);
        }

        if (resClientes.ok) {
          const dataClientes = await resClientes.json();
          setClientes(Array.isArray(dataClientes) ? dataClientes : []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 2. Procesar, calcular detalles y ordenar alfabéticamente por nombre de cliente
  useEffect(() => {
    if (remitos.length > 0) {
      const remitosCalculados = remitos.map((remito) => {
        // Filtrar movimientos: movimiento.remito.id = remito.id y movimientos.remito.cliente.id = cliente.id
        const movimientosDelRemito = movimientos.filter(
          (mov) => mov.remito && mov.remito.id === remito.id && mov.remito.cliente?.id === remito.cliente?.id
        );

        // Sumar cantidad de registros (Items)
        const totalItems = movimientosDelRemito.length;

        // Sumar movimiento.hormas
        const totalHormas = movimientosDelRemito.reduce((acc, mov) => acc + (mov.hormas || 0), 0);

        // Sumar movimiento.kgs
        const totalKgs = movimientosDelRemito.reduce((acc, mov) => acc + (mov.kgs || 0), 0);

        // Operador: operador.nombre si operador.id = remito.cdOperador
        const operador = operadores.find((op) => op.id === remito.cdOperador);
        const operadorNombre = operador?.nombre || 'N/A';

        return {
          ...remito,
          nRemito: `REM-${remito.id}`,
          totalItems,
          totalHormas,
          totalKgs,
          operadorNombre,
          movimientosDetalle: movimientosDelRemito
        };
      });

      // Ordenar alfabéticamente por nombre de cliente
      remitosCalculados.sort((a, b) => {
        const nombreA = a.cliente?.nombre || '';
        const nombreB = b.cliente?.nombre || '';
        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
      });

      setRemitosConDetalles(remitosCalculados);
    }
  }, [remitos, operadores, movimientos]);

  // 3. Filtrar remitos según las reglas de la interfaz y fechas
  const remitosVisibles = remitosConDetalles.filter((r) => {
    // Si Cliente = Todos (filtroCliente vacío), se muestran todos. Si se elige uno, solo ese.
    if (filtroCliente !== '' && String(r.cliente?.id) !== filtroCliente) {
      return false;
    }

    const fechaRemitoStr = r.fechaEgreso;
    
    if (fechaRemitoStr) {
      const fechaRemito = new Date(fechaRemitoStr).setHours(0, 0, 0, 1);
      //alert("Fecha Remito: " + fechaRemito)

      // Si ingresa Desde: remito.fechaEgreso >= fecha Desde
      if (filtroDesde) {
        const fechaDesde = new Date(filtroDesde).setHours(0, 0, 0, 0);
        if (fechaRemito <= fechaDesde) {
          return false;
        }
      }

      if (filtroHasta) {
        const fechaHasta = new Date(filtroHasta).setHours(0, 0, 0, 0);
        if (fechaRemito >= fechaHasta) {
          return false;
        }
      }
    }

    return true;
  });

  const limpiarFiltros = () => {
    setFiltroCliente('');
    setFiltroDesde('');
    setFiltroHasta('');
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="remito-cliente-page">
      {/* Navbar Superior */}
      <header className="navbar-remito">
        <div className="navbar-brand-remito">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu-remito">≡ Menú</button>
      </header>

      <main className="remito-cliente-container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
        {/* Navegación superior */}
        <div className="nav-actions-remito" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn-nav-top-remito" onClick={() => navigate('/dashboard')} style={btnStyleLight}>
            ← Inicio
          </button>
          <button className="btn-nav-top-remito" onClick={() => navigate(-1)} style={btnStyleLight}>
            ↰ Volver
          </button>
        </div>

        {/* Título principal */}
        <h2 className="screen-title-remito" style={{ color: '#2e6b4d', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>📦</span> Remitos emitidos
        </h2>

        {/* SECCIÓN DE FILTROS */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            Filtros
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'end' }}>
            
            {/* Cliente */}
            <div>
              <label style={labelStyle}>Cliente</label>
              <select 
                value={filtroCliente} 
                onChange={(e) => setFiltroCliente(e.target.value)}
                style={inputStyle}
              >
                <option value="">Todos</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Desde */}
            <div>
              <label style={labelStyle}>Desde</label>
              <input 
                type="date" 
                value={filtroDesde} 
                onChange={(e) => setFiltroDesde(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Hasta */}
            <div>
              <label style={labelStyle}>Hasta</label>
              <input 
                type="date" 
                value={filtroHasta} 
                onChange={(e) => setFiltroHasta(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Botón de limpiar */}
            <div>
              <button 
                onClick={limpiarFiltros}
                style={{ backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '9px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', width: '100%' }}
                title="Limpiar filtros"
              >
                ✕ Limpiar filtros
              </button>
            </div>

          </div>
        </div>

        {/* TABLA DE REMITOS */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            {remitosVisibles.length} remito(s)
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f7f5', color: '#2e6b4d', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Nº Remito</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Hormas</th>
                  <th style={thStyle}>Kgs</th>
                  <th style={thStyle}>Operador</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Cargando remitos...</td></tr>
                ) : remitosVisibles.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No hay remitos que coincidan con los filtros seleccionados.</td></tr>
                ) : (
                  remitosVisibles.map((remito) => (
                    <tr key={remito.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tdStyle}><strong>{remito.nRemito}</strong></td>
                      <td style={tdStyle}>{formatearFecha(remito.fechaEgreso)}</td>
                      <td style={tdStyle}>{remito.cliente?.nombre || 'N/A'}</td>
                      <td style={tdStyle}>{remito.totalItems}</td>
                      <td style={tdStyle}>{remito.totalHormas.toFixed(1)}</td>
                      <td style={tdStyle}>{remito.totalKgs.toFixed(1)}</td>
                      <td style={tdStyle}>{remito.operadorNombre}</td>
                      <td style={tdStyle}>
                        <button 
                          onClick={() => navigate(`/remito/${remito.id}`)} 
                          style={actionBtnStyle('#4caf50')} 
                          title="Ver"
                        >
                          Ver
                        </button>
                        <button 
                          style={actionBtnStyle('#ff9800')} 
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          style={actionBtnStyle('#f44336')} 
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

// Estilos auxiliares
const btnStyleLight = { backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '5px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px', color: '#444', verticalAlign: 'middle' };
const actionBtnStyle = (bgColor) => ({ backgroundColor: bgColor, border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' });

export default RemitoCliente;