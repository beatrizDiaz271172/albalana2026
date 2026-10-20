import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarDrawer from '../components/SidebarDrawer';
import { API_BASE } from '../Config';

const ExportarExcel = () => {
  const navigate = useNavigate();
  const [fechaDesde, setFechaDesde] = useState('');
  const [descargando, setDescargando] = useState(false);

  // Estado para controlar la visibilidad del menú lateral
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleDescargar = async (e) => {
    e.preventDefault();

    if (!fechaDesde) {
      alert('Por favor selecciona una fecha de inicio ("Fecha Desde").');
      return;
    }

    setDescargando(true);

    try {
      const token = localStorage.getItem('userToken');
      const url = `${API_BASE}/reportes/excel?fechaDesde=${fechaDesde}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte en el servidor.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Reporte_AlbaLana_${fechaDesde}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      alert('Error en la descarga: ' + error.message);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px', position: 'relative' }}>

      {/* Navbar Superior */}
      <header style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧀</span> Alba Lana
        </div>
        <button
          onClick={() => setMenuAbierto(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 'bold'
          }}
        >
          ☰ Menú
        </button>
      </header>

      {/* Menú lateral (misma forma que el Dashboard) */}
      <SidebarDrawer
        abierto={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activeRoute="exportar_excel"
      />

      <main style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>← Inicio</button>
          <button onClick={() => navigate(-1)} style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>↰ Volver</button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ color: '#2e6b4d', marginTop: 0, marginBottom: '15px', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Exportar Reporte Dinámico Excel
          </h2>

          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.4' }}>
            Genera y descarga un libro completo de Excel con todas las hojas de stock, movimientos, mermas y alertas filtrando los movimientos a partir de la fecha seleccionada.
          </p>

          <form onSubmit={handleDescargar}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="fechaDesde" style={{ display: 'block', fontWeight: 'bold', color: '#374151', marginBottom: '8px', fontSize: '0.9rem' }}>
                Fecha Desde (Filtrar Movimientos):
              </label>
              <input
                type="date"
                id="fechaDesde"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={descargando}
              style={{
                width: '100%',
                backgroundColor: descargando ? '#9ca3af' : '#2e6b4d',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: descargando ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {descargando ? '⌛ Generando Excel...' : '📥 Generar / Descargar Excel'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ExportarExcel;