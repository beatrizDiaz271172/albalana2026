import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrarIngreso'; // Asegurate de crear/renombrar tu CSS correspondiente
const API_BASE = 'http://192.168.0.32:8081/api';

const AjusteStock = () => {
  const navigate = useNavigate();

  // Fecha actual por defecto en formato ISO (YYYY-MM-DD)
  const hoy = new Date().toISOString().split('T')[0];

  const [camara, setCamara] = useState([]);
  const [producto, setProducto] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [lotes, setLotes] = useState([]);

  const [formData, setFormData] = useState({
    cdTipoMov: 3, // Representa el tipo de movimiento AJUSTE=3 (Ajustalo según tu BD)
    fechaAjuste: hoy,
    cdProducto: '',
    cdCamara: '',
    cdLote: '',
    cdOperador: '',
    hormas: 0.0,
    kgs: 0.0,
    motivo: ''
  });

  const [cargando, setCargando] = useState(false);

  // Obtener lotes desde la BD
  useEffect(() => {
    const obtenerLotes = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(API_BASE + '/lotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const lotesOrdenados = data.sort((a, b) => 
            (a.codigo || '').localeCompare(b.codigo || '')
          );
          setLotes(lotesOrdenados);
        }
      } catch (error) {
        console.error('Error al cargar Lotes:', error);
      }
    };
    obtenerLotes();
  }, []);

  // Obtener cámaras desde la BD
  useEffect(() => {
    const obtenerCamaras = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(API_BASE + '/camaras', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const ordenados = data.sort((a, b) => 
            (a.nombre || '').localeCompare(b.nombre || '')
          );
          setCamara(ordenados);
        }
      } catch (error) {
        console.error('Error al cargar cámaras:', error);
      }
    };
    obtenerCamaras();
  }, []);

  // Obtener productos desde la BD
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(API_BASE + '/productos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducto(data);
        }
      } catch (error) {
        console.error('Error al cargar Productos:', error);
      }
    };
    obtenerProductos();
  }, []);

  // Obtener operadores desde la BD
  useEffect(() => {
    const obtenerOperadores = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(API_BASE + '/operadores', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOperadores(data);
        }
      } catch (err) {
        console.error('Error al cargar operadores:', err);
      }
    };
    obtenerOperadores();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(API_BASE + '/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Ajuste de stock registrado con éxito!');
        navigate('/dashboard');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al registrar el ajuste: ${errData.mensaje || 'Ocurrió un error inesperado'}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="ingreso-page">
      {/* Navbar Superior */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu">≡ Menú</button>
      </header>

      {/* Contenido principal */}
      <main className="ingreso-container">
        {/* Navegación superior */}
        <div className="nav-actions">
          <button className="btn-nav-top" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button className="btn-nav-top" onClick={() => navigate(-1)}>
            ↰ Volver
          </button>
        </div>

        {/* Título principal */}
        <h2 className="screen-title">
          <span className="title-icon">⚖️</span> Ajuste de stock
        </h2>

        {/* Card Formulario */}
        <div className="form-card">
          <div className="form-card-header" style={{ backgroundColor: '#2e6b4d', color: 'white' }}>
            Corrección de stock real
          </div>
          
          <div style={{ padding: '15px 20px', color: '#555', fontSize: '0.95rem' }}>
            Fija los valores reales contados físicamente en una cámara.
          </div>

          <form onSubmit={handleSubmit} className="ingreso-form">
            <div className="form-grid">
              
              {/* Fecha de ajuste */}
              <div className="form-group">
                <label htmlFor="fechaAjuste">Fecha del ajuste</label>
                <input
                  type="date"
                  id="fechaAjuste"
                  name="fechaAjuste"
                  value={formData.fechaAjuste}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Producto */}
              <div className="form-group">
                <label htmlFor="cdProducto">Producto</label>
                <select
                  id="cdProducto"
                  name="cdProducto"
                  value={formData.cdProducto}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {producto.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cámara */}
              <div className="form-group">
                <label htmlFor="cdCamara">Cámara</label>
                <select
                  id="cdCamara"
                  name="cdCamara"
                  value={formData.cdCamara}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {camara.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lote (Agregado solicitado) */}
              <div className="form-group">
                <label htmlFor="cdLote">Lote</label>
                <select
                  id="cdLote"
                  name="cdLote"
                  value={formData.cdLote}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.codigo}>
                      {lote.codigo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operario / Operador */}
              <div className="form-group">
                <label htmlFor="cdOperador">Operario</label>
                <select
                  id="cdOperador"
                  name="cdOperador"
                  value={formData.cdOperador}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Div vacío para mantener la grilla alineada si usas grid-template-columns: 1fr 1fr */}
              <div className="form-group hidden-desktop"></div>

              {/* Hormas Reales */}
              <div className="form-group">
                <label htmlFor="hormas">Hormas REALES (nuevo valor)</label>
                <input
                  type="number"
                  step="0.01"
                  id="hormas"
                  name="hormas"
                  min="0"
                  value={formData.hormas}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Kgs Reales */}
              <div className="form-group">
                <label htmlFor="kgs">Kgs REALES (nuevo valor)</label>
                <input
                  type="number"
                  step="0.01"
                  id="kgs"
                  name="kgs"
                  min="0"
                  value={formData.kgs}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Motivo del ajuste */}
              <div className="form-group full-width">
                <label htmlFor="motivo">Motivo del ajuste</label>
                <input
                  type="text"
                  id="motivo"
                  name="motivo"
                  placeholder="Ej: Inventario físico"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button 
              type="submit" 
              className="btn-submit-ingreso" 
              style={{ backgroundColor: '#f09c5a', color: 'white', borderColor: '#e68a44' }} 
              disabled={cargando}
            >
              ⚖️ {cargando ? 'Registrando...' : 'Registrar ajuste'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AjusteStock;