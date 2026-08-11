import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';


const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://192.168.0.32:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();
      console.log('📦 RESPUESTA DEL BACKEND EN LOGIN:', data);

      if (response.ok && data.exito) {
        alert(`¡Bienvenido/a ${data.usuario}!`);
        
        // Guardamos credenciales/datos requeridos
        console.log(data.token);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data));
        
        // Redirección a la Pantalla Principal
        navigate('/dashboard');



      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. '+ err.mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Cabecera verde con ícono */}
        <div className="login-header">
          <div className="icon-cheese">🧀</div>
          <h1 className="title">Alba Lana</h1>
          <p className="subtitle">Control de Stock</p>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        {/* Pie de página con créditos */}
        <div className="login-footer">
          <p className="footer-title">Stock Alba Lana · Red local</p>
          <p className="footer-sub">Diseñado y programado por</p>
          <p className="footer-author">Dr. Raúl Jorge Rosa</p>
          <p className="footer-role">Profesor Titular de Administración Agraria · UNLP</p>
          <a href="mailto:rjr@agro.unlp.edu.ar" className="footer-email">
            rjr@agro.unlp.edu.ar
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;