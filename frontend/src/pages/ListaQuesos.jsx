import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListaQuesos.css';

// Base de la API centralizada
const API_BASE = 'http://192.168.0.32:8081/api'; 

export default function ListaQuesos() {
  const navigate = useNavigate();

  const [quesos, setQuesos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cabecera de autenticación con Bearer Token
  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
  };

  // Llamada asíncrona a tu API de Spring Boot
  useEffect(() => {
    const cargarQuesos = async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/quesos?limite=20`, { headers: authHeaders() });
        
        if (res.ok) {
          const data = await res.json();

          if (Array.isArray(data)) {
          setQuesos(data);
        } else if (Array.isArray(data.content)) {
          setQuesos(data.content);
        } else {
        console.error('Respuesta inesperada de la API:', data);
        setQuesos([]);
        setError('El servidor devolvió un formato de datos inesperado.');        
      }}} catch (err) {
        console.error("Error cargando los quesos:", err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    cargarQuesos();
  }, []);

  // Filtro lógico por nombre
const quesosFiltrados = quesos.filter((queso) => {
  const nombre = queso?.nombre?.trim() || '';
  return nombre === ''
    ? true
    : nombre.toLowerCase().includes(busqueda.toLowerCase());
});

  return (
    <div className="quesos-container">
      {/* Botones de navegación superiores */}
      <div className="quesos-navBar">
        <button className="quesos-navButton" onClick={() => navigate('/inicio')}>← Inicio</button>
        <button className="quesos-navButton" onClick={() => navigate(-1)}>↩ Volver</button>
      </div>

      {/* Título de la sección con icono decorativo */}
      <div className="quesos-titleContainer">
        <span className="quesos-titleIcon">🧀</span>
        <h2 className="quesos-title">Catálogo actual por producto y marca</h2>
      </div>

      {/* Filtro de búsqueda por nombre */}
      <div className="quesos-searchContainer">
        <input
          type="text"
          placeholder="🔍 Buscar queso por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="quesos-searchInput"
        />
      </div>

      {/* Contenedor de la Tabla Estilizada */}
      <div className="quesos-tableWrapper">
        <table className="quesos-table">
          <thead>
            <tr className="quesos-theadRow">
              <th style={{ width: '80px' }}>Imagen</th>
              <th>Producto</th>
              <th>Marca / Productor</th>
              <th>Ingredientes principales</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="5" className="quesos-tdCenter">Cargando catálogo de quesos...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="quesos-tdCenter error-mensaje">{error}</td>
              </tr>
            ) : quesosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="quesos-tdCenter">No se encontraron quesos con ese nombre.</td>
              </tr>
            ) : (
              quesosFiltrados.map((queso, index) => {
                const tieneIngredientes = queso.ingredientes && queso.ingredientes.length > 5;
                const estadoTxt = tieneIngredientes ? 'OK' : 'Bajo';
                const estadoClass = tieneIngredientes ? 'badge-ok' : 'badge-bajo';
                const filaClass = index % 2 === 0 ? 'quesos-trEven' : 'quesos-trOdd';

                return (
                  <tr key={index} className={filaClass}>
                    {/* Columna de Imagen */}
                    <td className="quesos-td">
                      {queso.imagenUrl ? (
                        <img src={queso.imagenUrl} alt={queso.nombre} className="quesos-productImg" />
                      ) : (
                        <div className="quesos-noImg">No disp.</div>
                      )}
                    </td>
                    {/* Columna de Nombre */}
                    <td className="quesos-td nombre-queso">
                      {queso.nombre || 'Sin nombre'}
                    </td>
                    {/* Columna de Marca */}
                    <td className="quesos-td">{queso.brands || 'Genérica'}</td>
                    {/* Columna de Ingredientes */}
                    <td className="quesos-td ingredientes-queso">
                      {queso.ingredientes ? (
                        queso.ingredientes.length > 120 
                          ? `${queso.ingredientes.substring(0, 120)}...` 
                          : queso.ingredientes
                      ) : (
                        <span className="sin-informacion">Información no disponible</span>
                      )}
                    </td>
                    {/* Columna de Estado Estilizado */}
                    <td className="quesos-td" style={{ textAlign: 'center' }}>
                      <span className={`badge ${estadoClass}`}>{estadoTxt}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
