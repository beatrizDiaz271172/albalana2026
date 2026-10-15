import React from 'react';

export default function Sidebar({ activeRoute = 'inicio', onNavigate }) {
  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'inicio', name: 'Inicio', icon: '🏠', functional: true },
        { id: 'stock_actual', name: 'Stock actual', icon: '📦', functional: true },
        { id: 'maduracion_lotes', name: 'Maduración lotes', icon: '⏳', functional: true },
        { id: 'mermas', name: 'Mermas', icon: '📉', functional: true },
      ]
    },
    {
      title: 'MOVIMIENTOS',
      items: [
        { id: 'ingreso_produccion', name: 'Ingreso de producción', icon: '📥', functional: true },
        { id: 'egreso_remito', name: 'Egreso / Remito', icon: '📤', functional: true },
        { id: 'ajuste_stock', name: 'Ajuste de stock', icon: '⚖️', functional: true },
        { id: 'transferencia', name: 'Transferencia', icon: '🔄', functional: true },
        { id: 'historial_movimientos', name: 'Historial movimientos', icon: '📋', functional: true },
        { id: 'remitos', name: 'Remitos', icon: '🚚', functional: true },
      ]
    },
    {
      title: 'CONFIGURACIÓN',
      items: [
        { id: 'definiciones', name: 'Definiciones', icon: '⚙️', functional: true },
        { id: 'exportar_excel', name: 'Exportar Excel', icon: '📊', functional: false },
        { id: 'campanias', name: 'Campañas', icon: '📅', functional: true },
        { id: 'imprimir_pdf', name: 'Imprimir / PDF', icon: '🖨️', functional: true },
        { id: 'red_local', name: 'Red local', icon: '📡', functional: true },
      ]
    },
    {
      title: 'SESIÓN',
      items: [
        { id: 'cambiar_contrasena', name: 'Cambiar contraseña', icon: '🔑', functional: false },
        { id: 'cerrar_sesion', name: 'Cerrar sesión', icon: '🚪', functional: true, danger: true },
      ]
    }
  ];

  const handleClick = (item) => {
    if (!item.functional) {
      alert(`La opción "${item.name}" se encuentra actualmente en desarrollo o es puramente visual.`);
      return;
    }
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      userSelect: 'none',
      position: 'relative'
    }}>
      
      {/* Cabecera del Sidebar */}
      <div style={{ backgroundColor: '#1b4d3e', padding: '16px', color: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>🧀</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.025em' }}>Alba Lana</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '2px', display: 'block', textTransform: 'uppercase', fontWeight: '500' }}>
          Control de Stock
        </span>
      </div>

      {/* Contenedor de Secciones */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {menuSections.map((section, secIdx) => (
          <div key={secIdx}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px', textTransform: 'uppercase' }}>
              {section.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const isActive = activeRoute === item.id;

                let bgHover = '#f3f4f6';
                let textColor = '#374151';
                if (isActive) {
                  bgHover = '#d1fae5';
                  textColor = '#065f46';
                } else if (item.danger) {
                  textColor = '#dc2626';
                  bgHover = '#fee2e2';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item)}
                    title={!item.functional ? "Sin funcionalidad implementada en el proyecto" : item.name}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '500',
                      backgroundColor: isActive ? '#d1fae5' : 'transparent',
                      color: textColor,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = item.danger ? '#fee2e2' : '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                      <span style={{ opacity: !item.functional ? 0.75 : 1 }}>
                        {item.name}
                      </span>
                    </div>

                    {!item.functional && (
                      <span style={{ fontSize: '9px', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>
                        Mockup
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pie de página institucional */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb', fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4', flexShrink: 0 }}>
        <p style={{ margin: 0, color: '#6b7280' }}>Diseñado y programado por</p>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>Dr. Raúl Jorge Rosa</p>
        <p style={{ margin: 0, color: '#6b7280' }}>Profesor Titular de Administración Agraria</p>
        <p style={{ margin: 0, color: '#6b7280' }}>UNLP</p>
        <p style={{ margin: '4px 0 0 0', color: '#047857', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis' }}>rjr@agro.unlp.edu.ar</p>
      </div>

    </aside>
  );
}