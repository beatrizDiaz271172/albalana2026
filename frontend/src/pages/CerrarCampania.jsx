import React, { useState } from 'react';
import { BASE_URL } from '../Config'; 

const CerrarCampaniaModal = ({ isOpen, onClose, onConfirm}) => {
  const [nombreCampania, setNombreCampania] = useState('');
  const [tipoAccion, setTipoAccion] = useState('desde_cero'); // 'desde_cero' o 'continuar'
  const [nombreConfirmacion, setNombreConfirmacion] = useState('');
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  // El nombre exacto que el usuario debe escribir para confirmar (por ejemplo, el nombre de la Campania actual o un texto de validación)
  const nombreValido = nombreCampania;
  const esValido = nombreConfirmacion.trim() === nombreValido.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esValido) return;

    setCargando(true);
    try {
      await onConfirm({
        nombreNuevaCampania: nombreCampania,
        accionStock: tipoAccion // 'desde_cero' o 'continuar'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Cabecera Roja */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <span className="modal-lock-icon">🔒</span>
            <h2>Cerrar Campania activa</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Nombre de la Campania */}
          <div className="modal-field">
            <label>Nombre de la Campania (ej: 2024-2025)</label>
            <input
              type="text"
              placeholder="Ej: 2024-2025 o Temporada Primavera"
              value={nombreCampania}
              onChange={(e) => setNombreCampania(e.target.value)}
              required
            />
          </div>

          <label className="modal-label-section">¿Qué hacer con el stock actual?</label>

          {/* Opciones de Radio / Tarjetas seleccionables */}
          <div 
            className={`modal-option-card ${tipoAccion === 'desde_cero' ? 'selected' : ''}`}
            onClick={() => setTipoAccion('desde_cero')}
          >
            <div className="modal-radio-container">
              <input 
                type="radio" 
                name="accionStock" 
                checked={tipoAccion === 'desde_cero'} 
                onChange={() => setTipoAccion('desde_cero')} 
              />
            </div>
            <div className="modal-option-content">
              <strong>Empezar desde cero</strong>
              <p>El stock y los movimientos se borran. La configuración (productos, cámaras, etc.) se mantiene.</p>
            </div>
          </div>

          <div 
            className={`modal-option-card ${tipoAccion === 'continuar' ? 'selected' : ''}`}
            onClick={() => setTipoAccion('continuar')}
          >
            <div className="modal-radio-container">
              <input 
                type="radio" 
                name="accionStock" 
                checked={tipoAccion === 'continuar'} 
                onChange={() => setTipoAccion('continuar')} 
              />
            </div>
            <div className="modal-option-content">
              <strong>Continuar con el stock actual</strong>
              <p>El stock actual pasa como ajuste inicial de la nueva Campania. Los movimientos anteriores se archivan.</p>
            </div>
          </div>

          {/* Alerta informativa */}
          <div className="modal-alert">
            <span className="modal-alert-icon">⚠️</span>
            <span className="modal-alert-text">
              Todos los datos de la Campania se guardan en una carpeta local (campanias/) y se genera un ZIP descargable automáticamente.
            </span>
          </div>

          {/* Confirmación por texto */}
          <div className="modal-field">
            <label>Escribí el nombre de la Campania para confirmar</label>
            <input
              type="text"
              placeholder="Nombre exacto"
              value={nombreConfirmacion}
              onChange={(e) => setNombreConfirmacion(e.target.value)}
              required
            />
            <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
              Escribí: <strong>{nombreValido}</strong>
            </small>
          </div>

          {/* Botones de acción inferior */}
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modal-btn-confirmar" 
              disabled={!esValido || cargando}
            >
              🔒 Cerrar y archivar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CerrarCampaniaModal;