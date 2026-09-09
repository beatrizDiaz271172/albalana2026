import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Alertas.css';

const API_BASE = 'http://192.168.0.32:8081/api';

// ============================================================================
// COMPONENTES AUXILIARES (Extraídos)
// ============================================================================

const Navbar = () => (
  <div style={{ backgroundColor: '#1e5338', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🌿 Alba Lana</h2>
    <button style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '4px 12px', borderRadius: '4px' }}>
      ☰ Menú
    </button>
  </div>
);

const MetricaCard = ({ valor, cargando, etiqueta }) => (
  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h1 style={{ margin: 0, color: '#1e5338' }}>{cargando ? '...' : valor}</h1>
    <span style={{ fontSize: '0.85rem', color: '#666' }}>{etiqueta}</span>
  </div>
);

const MetricasGrid = ({ stats, cargando }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
    <MetricaCard valor={stats.hormasStock} cargando={cargando} etiqueta="Hormas en stock" />
    <MetricaCard valor={stats.kgsStock} cargando={cargando} etiqueta="Kgs en stock" />
    <MetricaCard valor={stats.movimientos} cargando={cargando} etiqueta="Movimientos" />
  </div>
);

// ============================================================================
// BANNER DE ALERTAS CON CONTADOR DE CRÍTICAS
// ============================================================================
const AlertasBanner = ({ cantidadAlertas, alertasCriticas, cargando }) => (
  <div style={{ 
    backgroundColor: '#c92a2a', 
    color: 'white', 
    padding: '12px 24px', 
    borderRadius: '25px', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: '0.95rem', 
    marginBottom: '20px',
    display: 'inline-block',
    width: '100%',
    boxShadow: '0 4px 6px rgba(201, 42, 42, 0.3)'
  }}>
    🔔 {cargando ? '...' : cantidadAlertas} alertas — <span style={{ fontWeight: 'bold', color: '#FFD700' }}>{cargando ? '...' : alertasCriticas} CRÍTICAS</span> ↓ ver abajo
  </div>
);

const MenuGrid = ({ menuOptions, onOptionClick }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
    {menuOptions.map((opt, idx) => (
      <MenuOption key={idx} option={opt} onClick={() => onOptionClick(opt.path)} />
    ))}
  </div>
);

const MenuOption = ({ option, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: 'white',
      border: `2px solid ${option.color}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
  >
    <span style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{option.icon}</span>
    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '0.95rem' }}>{option.title}</span>
  </div>
);

const AlertasSection = ({ alertas, cargando, error }) => {
  if (cargando) {
    return <div className="alerta-estado-mensaje">Cargando lista de alertas...</div>;
  }

  if (error) {
    return <div className="alerta-estado-mensaje alerta-error">{error}</div>;
  }

  if (alertas.length === 0) {
    return <div className="alerta-estado-mensaje alerta-vacio">No hay alertas de inactividad registradas.</div>;
  }

  return (
    <>
      {alertas.map((alerta, index) => {
        // Definimos el emoji según el nivelAlerta
        let icono = 'ℹ️'; // Nivel 1 por defecto
        if (alerta.nivelAlerta === 2) icono = '⚠️';
        if (alerta.nivelAlerta === 3) icono = '⚠️⚠️';
        if (alerta.nivelAlerta === 4) icono = '🚨';

        return (
          <div 
            key={alerta.productoId || index} 
            className={`alerta-tarjeta tipo-${alerta.tipoAlerta} nivel-${alerta.nivelAlerta}`}
          >
            {/* Ícono dinámico */}
            <div className="alerta-icono-contenedor">
              <span className="alerta-emoji">{icono}</span>
            </div>
            
            {/* Contenido de texto */}
            <div className="alerta-texto-grupo">
              <div className="alerta-titulo">{alerta.productoNombre}</div>
              <div className="alerta-mensaje">{alerta.mensajeAlerta}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ============================================================================
// SERVICIOS / FUNCIONES UTILITARIAS
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };
};

const fetchMetricas = async () => {
  try {
    const [resStock, resMovimientos] = await Promise.all([
      fetch(`${API_BASE}/stock`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/movimientos`, { headers: getAuthHeaders() })
    ]);

    let totalHormas = 0;
    let totalKgs = 0;
    let totalMovimientos = 0;

    if (resStock.ok) {
      const dataStock = await resStock.json();
      if (Array.isArray(dataStock)) {
        const stockActivo = dataStock.filter(s => s.activo === true);
        totalHormas = stockActivo.reduce((acc, curr) => acc + (curr.hormas || 0), 0);
        totalKgs = stockActivo.reduce((acc, curr) => acc + (curr.kgs || 0), 0);
      }
    }

    if (resMovimientos.ok) {
      const dataMovimientos = await resMovimientos.json();
      if (Array.isArray(dataMovimientos)) {
        totalMovimientos = dataMovimientos.length;
      }
    }

    return {
      hormasStock: totalHormas,
      kgsStock: Number(totalKgs.toFixed(1)),
      movimientos: totalMovimientos
    };
  } catch (error) {
    console.error('Error al cargar las métricas del dashboard:', error);
    throw error;
  }
};

const fetchAlertas = async () => {
  try {
    const res = await fetch(`${API_BASE}/movimientos/alertas`, { headers: getAuthHeaders() });
    
    if (!res.ok) {
      throw new Error('Error al cargar las alertas del sistema.');
    }

    const data = await res.json();


    const alertasTipo1 = data.filter(alerta => alerta.tipoAlerta === 1);
    const ordenadosTipo1 = alertasTipo1.sort((a, b) =>
  (a.productoNombre || '').localeCompare(b.productoNombre || '') ||
  (a.loteNombre || '').localeCompare(b.loteNombre || '')
    );

    const alertasTipo2 = data.filter(alerta => alerta.tipoAlerta === 2);
    const ordenadosTipo2 = alertasTipo2.sort((a, b) => 
    (a.productoNombre || '').localeCompare(b.productoNombre || '') ||
  (a.loteNombre || '').localeCompare(b.loteNombre || '')
    );

    const alertasTipo3 = data.filter(alerta => alerta.tipoAlerta === 3);
    const ordenadosTipo3 = alertasTipo3.sort((a, b) => 
  (a.productoNombre || '').localeCompare(b.productoNombre || '') ||
  (a.loteNombre || '').localeCompare(b.loteNombre || '')
    );

    const alertasTipo4 = data.filter(alerta => alerta.tipoAlerta === 4);
    const ordenadosTipo4 = alertasTipo4.sort((a, b) => 
  (a.productoNombre || '').localeCompare(b.productoNombre || '') ||
  (a.loteNombre || '').localeCompare(b.loteNombre || '')
    );

    return [...ordenadosTipo2, ...ordenadosTipo1, ...ordenadosTipo3, ...ordenadosTipo4];
  } catch (error) {
    console.error('Error fetching alertas:', error);
    throw error;
  }
};

// ============================================================================
// FUNCIÓN PARA CONTAR ALERTAS CRÍTICAS
// ============================================================================
const contarAlertasCriticas = (alertas) => {
  return alertas.filter(alerta => alerta.nivelAlerta === 4).length;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Dashboard = () => {
  const navigate = useNavigate();

  // Estados de Métricas
  const [stats, setStats] = useState({ hormasStock: 0, kgsStock: 0, movimientos: 0 });
  const [cargandoMetricas, setCargandoMetricas] = useState(true);

  // Estados de Alertas
  const [alertas, setAlertas] = useState([]);
  const [cargandoAlertas, setCargandoAlertas] = useState(true);
  const [errorAlertas, setErrorAlertas] = useState(null);

  // Opciones del Menú
  const menuOptions = [
    { title: "Registrar ingreso", icon: "👤", color: "#1e5338", path: "/registrarIngreso" },
    { title: "Registrar egreso", icon: "👤", color: "#d9534f", path: "/registrarEgresoRemito" }, 
    { title: "Stock actual", icon: "📦", color: "#2e3880", path: "/stockProductoCamaras" },
    { title: "Movimientos", icon: "📋", color: "#7a3e9d", path: "/historialMovimientos" },
    { title: "Maduración lotes", icon: "⏳", color: "#1e5338", path: "/estadoMaduracionLoteCamara" },
    { title: "Mermas", icon: "📉", color: "#d9534f", path: "/mermasYPesoProm" },
    { title: "Remitos", icon: "📦", color: "#2e3880", path: "/remitoCliente" },
    { title: "Ajuste de stock", icon: "⚖️", color: "#7a3e9d", path: "/ajusteStock" },
    { title: "Transferencia", icon: "🔄", color: "#2e3880", path: "/transferenciaEntreCamaras" },
    { title: "Campañas", icon: "📅", color: "#7a3e9d" , path: "/GestionCampañas"},
    { title: "Definiciones", icon: "⚙️", color: "#1e5338", path: "/definicionesSistOpc" },
    { title: "Imprimir / PDF-- CONSULTAR API", icon: "🖨️", color: "#d9534f", path: "/listaQuesos"}
  ];

  // ========================================================================
  // EFFECT 1: Cargar Métricas (Hormas, Kgs, Movimientos)
  // ========================================================================
  useEffect(() => {
    const cargarMetricas = async () => {
      setCargandoMetricas(true);
      try {
        const data = await fetchMetricas();
        setStats(data);
      } catch (error) {
        console.error('Error cargando métricas:', error);
      } finally {
        setCargandoMetricas(false);
      }
    };

    cargarMetricas();
  }, []);

  // ========================================================================
  // EFFECT 2: Cargar Alertas
  // ========================================================================
  useEffect(() => {
    const cargarAlertas = async () => {
      setCargandoAlertas(true);
      setErrorAlertas(null);
      try {
        const data = await fetchAlertas();
        setAlertas(data);
      } catch (error) {
        console.error('Error cargando alertas:', error);
        setErrorAlertas(error.message || 'No se pudo conectar con el servidor de alertas.');
      } finally {
        setCargandoAlertas(false);
      }
    };

    cargarAlertas();
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleOptionClick = useCallback((path) => {
    if (path) {
      navigate(path);
    }
  }, [navigate]);

  // ========================================================================
  // CÁLCULOS
  // ========================================================================

  const alertasCriticas = contarAlertasCriticas(alertas);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 16px' }}>
        <MetricasGrid stats={stats} cargando={cargandoMetricas} />
        
        {/* Banner mejorado con contador de alertas críticas */}
        <AlertasBanner 
          cantidadAlertas={alertas.length} 
          alertasCriticas={alertasCriticas}
          cargando={cargandoAlertas} 
        />
        
        <MenuGrid menuOptions={menuOptions} onOptionClick={handleOptionClick} />

        {/* Sección de Alertas Detalladas */}
        <div className="alertas-contenedor" style={{ marginTop: '30px', paddingBottom: '40px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
            📋 Alertas Activas
          </h3>
          <AlertasSection alertas={alertas} cargando={cargandoAlertas} error={errorAlertas} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
