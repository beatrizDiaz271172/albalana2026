import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrarIngreso.css';
const API_BASE = import.meta.env.VITE_API_URL;
const RegistrarIngreso = () => {
const navigate = useNavigate();

  // Fecha actual por defecto en formato ISO (YYYY-MM-DD)
  const hoy = new Date().toISOString().split('T')[0];

  const [camara, setCamara] = useState([]);
  const [producto, setProducto] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [siguienteNumeroLote, setSiguienteNumeroLote] = useState('');

  const [formData, setFormData] = useState({
    cdTipoMov: 1, // Representa el tipo de movimiento INGRESO=1
    fechaElaboracion: hoy,
    cdProducto: '',
    cdLote: '',
    cdCamara: '',
    hormas: 0.0,
    kgs: 0.0,
    ltsLeche: 0.0,
    fermento: '',
    obs: '',
    cdOperador: '',
    cdCliente: '',
    motivo: ''
  });

  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const obtenerLotes = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE}/lotes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLotes(data);

          // Calcular el siguiente número de lote (max(id) + 1)
          if (data.length > 0) {
            const maxId = Math.max(...data.map(l => Number(l.id) || 0));
            const nuevoNro = maxId + 1;
            setSiguienteNumeroLote(nuevoNro);
            // Asignar automáticamente al formData
            setFormData(prev => ({ ...prev, cdLote: 'LOTE-' +nuevoNro }));
          } else {
            setSiguienteNumeroLote(1);
            setFormData(prev => ({ ...prev, cdLote: 'LOTE-1' }));
          }
        }
      } catch (error) {
        console.error('Error al cargar Lotes :', error);
      }
    };
    obtenerLotes();
  }, []);

  // Obtener cámaras desde la BD
  useEffect(() => {
    const obtenerCamaras = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE}/camaras`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const ordenados = data.sort((a, b) => 
              (a.nombre || '').localeCompare(b.nombre || ''));
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
        const response = await fetch(`${API_BASE}/productos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
        const res = await fetch(`${API_BASE}/operadores`, {
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
      const response = await fetch(`${API_BASE}/movimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Ingreso de producción registrado con éxito!');
        navigate('/dashboard');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al registrar: ${errData.mensaje || 'Ocurrió un error inesperado'}`);
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
          <span className="title-icon">📥</span> Registrar ingreso de producción
        </h2>

        {/* Card Formulario */}
        <div className="form-card">
          <div className="form-card-header">
            Datos del lote
          </div>

          <form onSubmit={handleSubmit} className="ingreso-form">
            <div className="form-grid">
              
              {/* Fecha de elaboración */}
              <div className="form-group">
                <label htmlFor="fechaElaboracion">Fecha de elaboración</label>
                <input
                  type="date"
                  id="fechaElaboracion"
                  name="fechaElaboracion"
                  value={formData.fechaElaboracion}
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
                  <option value="">-- Seleccionar --</option>
                  {producto.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* N° de lote automático */}
              <div className="form-group">
                <label>N° de lote</label>
                <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #ccc' }}>
                  LOTE-{siguienteNumeroLote || '...'}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cdCamara">Cámara</label>
                <select
                  id="cdCamara"
                  name="cdCamara"
                  value={formData.cdCamara}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {camara.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hormas */}
              <div className="form-group">
                <label htmlFor="hormas">Hormas</label>
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

              {/* Kgs */}
              <div className="form-group">
                <label htmlFor="kgs">Kgs</label>
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

              {/* Litros de leche */}
              <div className="form-group">
                <label htmlFor="ltsLeche">Litros de leche</label>
                <input
                  type="number"
                  step="0.01"
                  id="ltsLeche"
                  name="ltsLeche"
                  min="0"
                  value={formData.ltsLeche}
                  onChange={handleChange}
                />
              </div>

              {/* Fermento */}
              <div className="form-group">
                <label htmlFor="fermento">Fermento</label>
                <input
                  type="text"
                  id="fermento"
                  name="fermento"
                  placeholder="Opcional"
                  value={formData.fermento}
                  onChange={handleChange}
                />
              </div>

              {/* Operario / Operador */}
              <div className="form-group full-width">
                <label htmlFor="cdOperador">Operario</label>
                <select
                  id="cdOperador"
                  name="cdOperador"
                  value={formData.cdOperador}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div className="form-group full-width">
                <label htmlFor="obs">Observaciones</label>
                <textarea
                  id="obs"
                  name="obs"
                  rows="3"
                  placeholder="Opcional"
                  value={formData.obs}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button type="submit" className="btn-submit-ingreso" disabled={cargando}>
              📥 {cargando ? 'Guardando...' : 'Registrar Ingreso'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegistrarIngreso;