import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate(); // Hook para la navegación

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const stats = userData.stats || { hormasStock: 40, kgsStock: 107.7, movimientos: 12 };

  const menuOptions = [
    { title: "Registrar ingreso", icon: "👤", color: "#1e5338", path: "/registrarIngreso" },
    { title: "Registrar egreso", icon: "👤", color: "#d9534f", path: "/registrarEgresoRemito" }, // 👈 se agrega la ruta 'path'
    { title: "Stock actual", icon: "📦", color: "#2e3880" },
    { title: "Movimientos", icon: "📋", color: "#7a3e9d" },
    { title: "Maduración lotes", icon: "⏳", color: "#1e5338" },
    { title: "Mermas", icon: "📉", color: "#d9534f" },
    { title: "Remitos", icon: "📦", color: "#2e3880" },
    { title: "Ajuste de stock", icon: "⚖️", color: "#7a3e9d", path: "/AjusteStock" },
    { title: "Transferencia", icon: "🔄", color: "#2e3880" },
    { title: "Campañas", icon: "📅", color: "#7a3e9d" },
    { title: "Definiciones", icon: "⚙️", color: "#1e5338" },
    { title: "Imprimir / PDF", icon: "🖨️", color: "#d9534f" }
  ];

  const handleOptionClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Navbar Superior */}
      <div style={{ backgroundColor: '#1e5338', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🌿 Alba Lana</h2>
        <button style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '4px 12px', borderRadius: '4px' }}>
          ☰ Menú
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 16px' }}>
        {/* Métricas / Indicadores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h1 style={{ margin: 0, color: '#1e5338' }}>{stats.hormasStock}</h1>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Hormas en stock</span>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h1 style={{ margin: 0, color: '#1e5338' }}>{stats.kgsStock}</h1>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Kgs en stock</span>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h1 style={{ margin: 0, color: '#1e5338' }}>{stats.movimientos}</h1>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Movimientos</span>
          </div>
        </div>

        {/* Alertas */}
        <div style={{ backgroundColor: '#c92a2a', color: 'white', padding: '8px 16px', borderRadius: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px' }}>
          ⚠️ 16 alertas — 2 CRÍTICAS ↓ ver abajo
        </div>

        {/* Grid de Accesos Directos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {menuOptions.map((opt, idx) => (
            <div 
              key={idx} 
              onClick={() => handleOptionClick(opt.path)} // Evento click para navegar
              style={{
                backgroundColor: 'white',
                border: `2px solid ${opt.color}`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</span>
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: '0.95rem' }}>{opt.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
