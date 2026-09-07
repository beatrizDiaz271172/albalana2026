import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DefinicionesSistema.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const DefinicionesSistema = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    maduracionDias: '',
    consumoOptDias: '',
    stockMinimo: '',
    preMaduracionDias: '',
    postMaduracionDias: '',
    diasSinMov: ''
  });

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  // 1. Cargar productos al montar
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_BASE}/productos`, { 
        headers: authHeaders() 
      });

      if (response.ok) {
        const dataProductos = await response.json();
        const listaArray = Array.isArray(dataProductos) ? dataProductos : [];

        // Ordenar alfabéticamente por nombre (ignorando mayúsculas/minúsculas y acentos)
        listaArray.sort((a, b) => {
          const nombreA = a.nombre ? a.nombre.toLowerCase() : '';
          const nombreB = b.nombre ? b.nombre.toLowerCase() : '';
          return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });

        setProductos(listaArray);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre || formData.nombre.trim() === '') {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else {
      const nombreTrimmed = formData.nombre.trim().toLowerCase();
      debugger;
      if (productos.length>0){
        const nombreDuplicado = productos.some(
        (prod) =>
          prod.nombre.toLowerCase() === nombreTrimmed &&
          prod.id !== editando
      );
      if (nombreDuplicado) {
        nuevosErrores.nombre = 'Este nombre de producto ya existe';
      }
    }      
  }

    if (!formData.codigo || formData.codigo.trim() === '') {
      nuevosErrores.codigo = 'El código es requerido';
    }

    const maduracion = Number(formData.maduracionDias);
    if (!formData.maduracionDias || maduracion <= 0) {
      nuevosErrores.maduracionDias = 'La maduración debe ser mayor a 0';
    }

    const preMaduracion = Number(formData.preMaduracionDias);
    if (formData.preMaduracionDias === '' || preMaduracion <= 0) {
      nuevosErrores.preMaduracionDias = 'La pre-maduración es requerida y debe ser mayor a 0';
    } else if (maduracion > 0 && preMaduracion >= maduracion) {
      nuevosErrores.preMaduracionDias = 'Debe ser menor que los días de maduración';
    }

    const postMaduracion = Number(formData.postMaduracionDias);
    if (formData.postMaduracionDias === '' || postMaduracion <= 0) {
      nuevosErrores.postMaduracionDias = 'La post-maduración es requerida y debe ser mayor a 0';
    }

    const consumoOpt = Number(formData.consumoOptDias);
    if (!formData.consumoOptDias || consumoOpt <= 0) {
      nuevosErrores.consumoOptDias = 'El consumo óptimo debe ser mayor a 0';
    }

    const stockMin = Number(formData.stockMinimo);
    if (formData.stockMinimo === '' || stockMin < 0) {
      nuevosErrores.stockMinimo = 'El stock mínimo debe ser 0 o mayor';
    }

    const diasSinMovVal = Number(formData.diasSinMov);
    if (formData.diasSinMov === '' || diasSinMovVal <= 0) {
      nuevosErrores.diasSinMov = 'Los días sin movimiento son requeridos y deben ser mayores a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const [bloquearIdentificadores, setBloquearIdentificadores] = useState(false);

  const handleAbrirModal = async (producto = null) => {
    if (producto) {
      setEditando(producto.id);
      
      // Ejemplo: Validar si el producto tiene lotes asociados 
      // (puedes ajustar esta condición según cómo recibas o consultes la información de lotes)
      try {
        const resLotes = await fetch(`${API_BASE}/lotes/producto/${producto.id}`, { headers: authHeaders() });
        if (resLotes.ok) {
          const lotesAsociados = await resLotes.json();
          setBloquearIdentificadores(Array.isArray(lotesAsociados) && lotesAsociados.length > 0);
        }
      } catch (e) {
        setBloquearIdentificadores(false);
      }

      setFormData({
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        maduracionDias: producto.maduracionDias ?? '',
        consumoOptDias: producto.consumoOptDias ?? '',
        stockMinimo: producto.stockMinimo ?? '',
        preMaduracionDias: producto.preMaduracionDias ?? '',
        postMaduracionDias: producto.postMaduracionDias ?? '',
        diasSinMov: producto.diasSinMov ?? ''
      });
    } else {
      setEditando(null);
      setBloquearIdentificadores(false);
      setFormData({
        nombre: '',
        codigo: '',
        maduracionDias: '',
        consumoOptDias: '',
        stockMinimo: '',
        preMaduracionDias: '',
        postMaduracionDias: '',
        diasSinMov: ''
      });
    }
    setErrores({});
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      codigo: '',
      maduracionDias: '',
      consumoOptDias: '',
      stockMinimo: '',
      preMaduracionDias: '',
      postMaduracionDias: '',
      diasSinMov: ''
    });
    setErrores({});
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      codigo: formData.codigo.trim(),
      maduracionDias: Number(formData.maduracionDias),
      consumoOptDias: Number(formData.consumoOptDias),
      stockMinimo: Number(formData.stockMinimo),
      preMaduracionDias: Number(formData.preMaduracionDias),
      postMaduracionDias: Number(formData.postMaduracionDias),
      diasSinMov: Number(formData.diasSinMov)
    };

    try {
      const url = editando 
        ? `${API_BASE}/productos/${editando}` 
        : `${API_BASE}/productos`;
      
      debugger;
        const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editando ? '✓ Producto actualizado' : '✓ Producto creado');
        await cargarProductos();
        handleCerrarModal();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error: ${errData.mensaje || 'No se pudo guardar el producto'}`);
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro que querés eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        alert('✓ Producto eliminado');
        await cargarProductos();
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    }
  };

  return (
    <div className="definiciones-page">
      {/* Navbar Superior */}
      <header className="navbar-def">
        <div className="navbar-brand-def">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu-def">≡ Menú</button>
      </header>

      <main className="definiciones-container">
        {/* Navegación superior */}
        <div className="nav-actions-def">
          <button className="btn-nav-top-def" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button className="btn-nav-top-def" onClick={() => navigate(-1)}>
            ↰ Volver
          </button>
        </div>

        {/* Título principal */}
        <div className="header-def">
          <h2 className="screen-title-def">
            <span className="title-icon">⚙️</span> Mantenimiento de Productos
          </h2>
          <button className="btn-agregar" onClick={() => handleAbrirModal()}>
            ➕ Agregar producto
          </button>
        </div>

        {/* Tabla de productos */}
        <div className="card-def tabla-container">
          {cargando ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              Cargando productos...
            </p>
          ) : productos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No hay productos registrados. Haz clic en "Agregar producto" para crear uno.
            </p>
          ) : (
            <table className="tabla-definiciones">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Maduración (días)</th>
                  <th>Pre-Maduración</th>
                  <th>Post-Maduración</th>
                  <th>Consumo Ópt. (días)</th>
                  <th>Stock Mín.</th>
                  <th>Días sin Mov.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="celda-id">
                      <strong>{producto.id}</strong>
                    </td>
                    <td className="celda-nombre">
                      {producto.nombre}
                    </td>
                    <td className="celda-codigo">
                      <code>{producto.codigo}</code>
                    </td>
                    <td className="celda-numero">
                      {producto.maduracionDias}
                    </td>
                    <td className="celda-numero">
                      {producto.preMaduracionDias ?? '-'}
                    </td>
                    <td className="celda-numero">
                      {producto.postMaduracionDias ?? '-'}
                    </td>
                    <td className="celda-numero">
                      {producto.consumoOptDias}
                    </td>
                    <td className="celda-numero">
                      {producto.stockMinimo}
                    </td>
                    <td className="celda-numero">
                      {producto.diasSinMov ?? '-'}
                    </td>
                    <td className="celda-acciones">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => handleAbrirModal(producto)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => handleEliminar(producto.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editando ? '✏️ Editar producto' : '➕ Agregar producto'}
              </h3>
              <button className="btn-cerrar-modal" onClick={handleCerrarModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
             {/* Nombre */}
              <div className="form-group-def">
                <label htmlFor="nombre">
                  Nombre * {bloquearIdentificadores && <small style={{color: '#e67e22'}}>(Bloqueado por tener lotes asociados)</small>}
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Queso Fresco"
                  readOnly={bloquearIdentificadores}
                  className={`${errores.nombre ? 'input-error' : ''} ${bloquearIdentificadores ? 'input-readonly' : ''}`}
                  style={bloquearIdentificadores ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                />
                {errores.nombre && (
                  <span className="error-msg">{errores.nombre}</span>
                )}
              </div>

              {/* Código */}
              <div className="form-group-def">
                <label htmlFor="codigo">Código *</label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: QF-001"
                  className={errores.codigo ? 'input-error' : ''}
                />
                {errores.codigo && (
                  <span className="error-msg">{errores.codigo}</span>
                )}
              </div>

              {/* Maduración (días) */}
              <div className="form-group-def">
                <label htmlFor="maduracionDias">Maduración (días) *</label>
                <input
                  type="number"
                  id="maduracionDias"
                  name="maduracionDias"
                  min="1"
                  value={formData.maduracionDias}
                  onChange={handleInputChange}
                  placeholder="Ej: 60"
                  className={errores.maduracionDias ? 'input-error' : ''}
                />
                {errores.maduracionDias && (
                  <span className="error-msg">{errores.maduracionDias}</span>
                )}
              </div>

              {/* Pre-Maduración (días) */}
              <div className="form-group-def">
                <label htmlFor="preMaduracionDias">Pre-Maduración (días) *</label>
                <input
                  type="number"
                  id="preMaduracionDias"
                  name="preMaduracionDias"
                  min="1"
                  value={formData.preMaduracionDias}
                  onChange={handleInputChange}
                  placeholder="Ej: 7"
                  className={errores.preMaduracionDias ? 'input-error' : ''}
                />
                {errores.preMaduracionDias && (
                  <span className="error-msg">{errores.preMaduracionDias}</span>
                )}
              </div>

              {/* Post-Maduración (días) */}
              <div className="form-group-def">
                <label htmlFor="postMaduracionDias">Post-Maduración (días) *</label>
                <input
                  type="number"
                  id="postMaduracionDias"
                  name="postMaduracionDias"
                  min="1"
                  value={formData.postMaduracionDias}
                  onChange={handleInputChange}
                  placeholder="Ej: 30"
                  className={errores.postMaduracionDias ? 'input-error' : ''}
                />
                {errores.postMaduracionDias && (
                  <span className="error-msg">{errores.postMaduracionDias}</span>
                )}
              </div>

              {/* Consumo Óptimo (días) */}
              <div className="form-group-def">
                <label htmlFor="consumoOptDias">Consumo Óptimo (días) *</label>
                <input
                  type="number"
                  id="consumoOptDias"
                  name="consumoOptDias"
                  min="1"
                  value={formData.consumoOptDias}
                  onChange={handleInputChange}
                  placeholder="Ej: 30"
                  className={errores.consumoOptDias ? 'input-error' : ''}
                />
                {errores.consumoOptDias && (
                  <span className="error-msg">{errores.consumoOptDias}</span>
                )}
              </div>

              {/* Stock Mínimo */}
              <div className="form-group-def">
                <label htmlFor="stockMinimo">Stock Mínimo *</label>
                <input
                  type="number"
                  id="stockMinimo"
                  name="stockMinimo"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={handleInputChange}
                  placeholder="Ej: 10"
                  className={errores.stockMinimo ? 'input-error' : ''}
                />
                {errores.stockMinimo && (
                  <span className="error-msg">{errores.stockMinimo}</span>
                )}
              </div>

              {/* Días sin Movimiento */}
              <div className="form-group-def">
                <label htmlFor="diasSinMov">Días sin Movimiento *</label>
                <input
                  type="number"
                  id="diasSinMov"
                  name="diasSinMov"
                  min="1"
                  value={formData.diasSinMov}
                  onChange={handleInputChange}
                  placeholder="Ej: 30"
                  className={errores.diasSinMov ? 'input-error' : ''}
                />
                {errores.diasSinMov && (
                  <span className="error-msg">{errores.diasSinMov}</span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={handleCerrarModal}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={handleGuardar}>
                {editando ? 'Actualizar' : 'Crear'} Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefinicionesSistema;