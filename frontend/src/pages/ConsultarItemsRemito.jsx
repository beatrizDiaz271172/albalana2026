import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './RemitoCliente.css'; // Reutilizamos los estilos o puedes usar estilos propios

const API_BASE = 'http://192.168.0.32:8081/api';

const ConsultarItemsRemito = () => {
  const navigate = useNavigate();
  const { remitoId } = useParams(); // Captura el parámetro :remitoId de la URL

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    if (!remitoId) return;

    const cargarItemsRemito = async () => {
      setCargando(true);
      try {
        const response = await fetch(`${API_BASE}/remitos/${remitoId}/items`, {
          headers: authHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          setItems(Array.isArray(data) ? data : []);
        } else {
          console.error('Error al obtener los ítems del remito');
        }
      } catch (error) {
        console.error('Error de red al cargar los ítems:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarItemsRemito();
  }, [remitoId]);

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

      <main className="remito-cliente-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
          <span>📋</span> Ítems del Remito REM-{remitoId}
        </h2>

        {/* TABLA DE ÍTEMS */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            Listado de Movimientos / Ítems
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f7f5', color: '#2e6b4d', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Cámara</th>
                  <th style={thStyle}>Lote</th>
                  <th style={thStyle}>Hormas</th>
                  <th style={thStyle}>Kgs</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Cargando ítems...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                      No se encontraron ítems para este remito.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tdStyle}>{item.lote.producto?.nombre || 'N/A'}</td>
                      <td style={tdStyle}>{item.lote.camara?.nombre || 'N/A'}</td>
                      <td style={tdStyle}>{item.lote?.codigo || 'N/A'}</td>
                      <td style={tdStyle}>{item.hormas ?? 0}</td>
                      <td style={tdStyle}>{item.kgs ? Number(item.kgs).toFixed(1) : '0.0'}</td>
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

// Estilos auxiliares consistentes con tu otra pantalla
const btnStyleLight = { backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px', color: '#444', verticalAlign: 'middle' };

export default ConsultarItemsRemito;