import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarDrawer from '../components/SidebarDrawer';
import { API_BASE } from '../Config';

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const Navbar = ({ onToggleMenu }) => (
  <div style={{ backgroundColor: '#1e5338', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🌿 Alba Lana — Seguridad</h2>
    <button 
      onClick={onToggleMenu}
      style={{ 
        background: 'rgba(255, 255, 255, 0.15)', 
        border: '1px solid rgba(255, 255, 255, 0.4)', 
        color: 'white', 
        padding: '6px 14px', 
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      ☰ Menú
    </button>
  </div>
);

// ============================================================================
// SERVICIOS UTILITARIOS
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };
};

const actualizarPasswordAPI = async (password , nuevaPassword) => {
  // Asumiendo que el backend recibe un DTO o parámetros para verificar la actual y cambiarla.
  // Puedes ajustar la ruta '/usuarios/cambiar-password' o pasar el ID según tu API de Spring Boot.
  const response = await fetch(`${API_BASE}/usuarios/cambiar-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      password ,
      nuevaPassword
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'La contraseña actual es incorrecta o hubo un error al actualizar.');
  }

  return await response.json();
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const CambiarPassword = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estados del formulario
  const [password , setpassword ] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Estados de feedback
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion(null);
    setMensajeExito(null);

    // Validación visual básica en el frontend
    if (!password  || !nuevaPassword || !confirmarPassword) {
      setErrorValidacion('Por favor, completa todos los campos.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorValidacion('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (nuevaPassword.length < 6) {
      setErrorValidacion('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      await actualizarPasswordAPI(password , nuevaPassword);
      setMensajeExito('¡Contraseña actualizada con éxito!');
      // Limpiar campos
      setpassword ('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setErrorValidacion(error.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh', position: 'relative' }}>
      
      <Navbar onToggleMenu={() => setMenuAbierto(true)} />

      <SidebarDrawer
        abierto={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activeRoute="cambiarPassword"
      />

      {/* Contenedor principal del Formulario */}
      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
        }}>
          
          <h3 style={{ color: '#1e5338', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            🔒 Cambiar Contraseña
          </h3>

          {/* Mensajes de error o éxito */}
          {errorValidacion && (
            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #f5c6cb' }}>
              ⚠️ {errorValidacion}
            </div>
          )}

          {mensajeExito && (
            <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #c3e6cb' }}>
              ✅ {mensajeExito}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                Contraseña actual
              </label>
              <input 
                type="password"
                value={password }
                onChange={(e) => setpassword (e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                Nueva contraseña
              </label>
              <input 
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                Confirmar nueva contraseña
              </label>
              <input 
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="submit" 
                disabled={cargando}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#1e5338', 
                  color: 'white', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  opacity: cargando ? 0.7 : 1,
                  fontSize: '1rem'
                }}
              >
                {cargando ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#e5e7eb', 
                  color: '#333', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default CambiarPassword;