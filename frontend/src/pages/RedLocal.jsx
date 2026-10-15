import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // Importamos el generador de QR
import Sidebar from './Sidebar';
import { API_BASE } from '../Config';

const RedLocal = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [nombreEquipo, setNombreEquipo] = useState('Cargando...');
  const [ipLocal, setIpLocal] = useState('192.168.0.32');
  const [puerto, setPuerto] = useState('5173');
  const [escuchandoEn, setEscuchandoEn] = useState('0.0.0.0 (todas las interfaces)');
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const obtenerInfoRed = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE}/red/info`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.nombreEquipo) setNombreEquipo(data.nombreEquipo);
          if (data.ipLocal) setIpLocal(data.ipLocal);
          if (data.puerto) setPuerto(data.puerto);
          if (data.escuchandoEn) setEscuchandoEn(data.escuchandoEn);
        } else {
          const currentHostname = window.location.hostname;
          const currentPort = window.location.port || '5173';
          setNombreEquipo(window.location.host || 'localhost');
          setIpLocal(currentHostname === 'localhost' ? '192.168.0.32' : currentHostname);
          setPuerto(currentPort);
        }
      } catch (error) {
        const currentHostname = window.location.hostname;
        setIpLocal(currentHostname === 'localhost' ? '192.168.0.32' : currentHostname);
        setNombreEquipo('Servidor Local');
      } finally {
        setCargando(false);
      }
    };
    obtenerInfoRed();
  }, []);

  const direccionUrl = `http://${ipLocal}:${puerto}`;

  const handleCopiar = () => {
    navigator.clipboard.writeText(direccionUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleSidebarNavigate = (itemId) => {
    setMenuAbierto(false);
    if (itemId === 'inicio') navigate('/');
    if (itemId === 'stock_actual') navigate('/stockProductoCamaras');
    if (itemId === 'maduracion_lotes') navigate('/estadoMaduracionLoteCamara');
    if (itemId === 'ingreso_produccion') navigate('/registrarIngreso');
    if (itemId === 'egreso_remito') navigate('/registrarEgresoRemito');
    if (itemId === 'ajuste_stock') navigate('/ajusteStock');
    if (itemId === 'historial_movimientos') navigate('/historialMovimientos');
    if (itemId === 'remitos') navigate('/remitoCliente');
    if (itemId === 'imprimir_pdf' || itemId === 'exportar_excel') navigate('/reporteImprimible');
    if (itemId === 'cerrar_sesion') {
      localStorage.removeItem('userToken');
      navigate('/login');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh', position: 'relative' }}>
      
      {/* Navbar Superior */}
      <div style={{ backgroundColor: '#1e5338', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>🧀 Alba Lana</h2>
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.4)', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}
        >
          ☰ Menú
        </button>
      </div>

      {/* Sidebar Desplegable */}
      {menuAbierto && (
        <>
          <div onClick={() => setMenuAbierto(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1001 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1002 }}>
            <Sidebar activeRoute="red_local" onNavigate={handleSidebarNavigate} />
          </div>
        </>
      )}

      {/* Contenido Principal */}
      <div style={{ maxWidth: '850px', margin: '30px auto', padding: '0 16px' }}>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 16px', borderRadius: '16px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
            ← Inicio
          </button>
          <button onClick={() => navigate(-1)} style={{ backgroundColor: 'transparent', color: '#4b5563', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
            ↩ Volver
          </button>
        </div>

        <h2 style={{ color: '#1e5338', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem', marginBottom: '20px' }}>
          📡 Red y conexión de dispositivos
        </h2>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          
          <div style={{ backgroundColor: '#2d6a4f', color: 'white', padding: '12px 20px', fontWeight: 'bold' }}>
            💻 Este servidor
          </div>

          <div style={{ padding: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.5fr', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Nombre del equipo</span>
                <strong style={{ fontSize: '1.05rem', color: '#111827' }}>{cargando ? '...' : nombreEquipo}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>IP en la red local</span>
                <strong style={{ fontSize: '1.4rem', color: '#1e5338' }}>{cargando ? '...' : ipLocal}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Puerto</span>
                <strong style={{ fontSize: '1.4rem', color: '#111827' }}>{puerto}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Escuchando en</span>
                <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ✅ {escuchandoEn}
                </span>
              </div>
            </div>

            {/* Recuadro de Conexión WiFi + Código QR para celulares */}
            <div style={{ backgroundColor: '#e8f5e9', borderRadius: '8px', padding: '20px', border: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              
              <div>
                <span style={{ fontSize: '0.85rem', color: '#4b5563', display: 'block', marginBottom: '6px' }}>
                  Dirección para dispositivos en esta red WiFi:
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e5338', marginBottom: '16px' }}>
                  {direccionUrl}
                </div>

                <button
                  onClick={handleCopiar}
                  style={{
                    backgroundColor: copiado ? '#15803d' : '#2d6a4f',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📋 {copiado ? '¡Dirección copiada!' : 'Copiar dirección'}
                </button>
              </div>

              {/* Contenedor del Código QR */}
              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', flexShrink: 0 }}>
                {!cargando && (
                  <QRCodeCanvas 
                    value={direccionUrl} 
                    size={110} 
                    level={"H"} 
                    includeMargin={true}
                  />
                )}
                <span style={{ fontSize: '10px', color: '#555', display: 'block', marginTop: '2px', fontWeight: 'bold' }}>
                  Escanear con Movil
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RedLocal;