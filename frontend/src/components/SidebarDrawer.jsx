import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';
import { RUTAS_SIDEBAR } from './sidebarRoutes';

export default function SidebarDrawer({ abierto, onClose, activeRoute }) {
  const navigate = useNavigate();

  // Cierra con la tecla Esc
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onClose]);

  const handleSidebarNavigate = (itemId) => {
    onClose();

    if (itemId === 'cerrar_sesion') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      navigate('/login', { replace: true });
      return;
    }

    const path = RUTAS_SIDEBAR[itemId];
    if (path) navigate(path);
  };

  if (!abierto) return null;

  return (
    <div className="rep-noprint">
      {/* Backdrop: cierra al hacer clic afuera */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1001,
        }}
      />
      {/* Panel lateral */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1002,
          boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
        }}
      >
        <Sidebar activeRoute={activeRoute} onNavigate={handleSidebarNavigate} />
      </div>
    </div>
  );
}
