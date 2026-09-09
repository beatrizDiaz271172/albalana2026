import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CerrarCampaña from './CerrarCampaña';
import './GestionCampañas.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const GestionCampañas = () => {
  const navigate = useNavigate();
  const [campañaActiva, setCampañaActiva] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [metricas, setMetricas] = useState({
    movimientos: 0,
    hormasStock: 0,
    kgsStock: 0
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalCerrarAbierto, setModalCerrarAbierto] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const [resCampanias, resStock, resMovimientos] = await Promise.all([
          fetch(`${API_BASE}/campanias`, { headers: authHeaders() }),
          fetch(`${API_BASE}/stock`, { headers: authHeaders() }),
          fetch(`${API_BASE}/movimientos`, { headers: authHeaders() })
        ]);

        if (!resCampanias.ok) {
          throw new Error('No se pudo obtener la información de las campañas.');
        }

        const dataCampanias = await resCampanias.json();

        if (Array.isArray(dataCampanias)) {
          const activaEncontrada = dataCampanias.find(c => c.activo === true) || null;
          const historialFiltrado = dataCampanias.filter(c => c.activo === false);
          debugger;
          setCampañaActiva(activaEncontrada);
          setHistorial(historialFiltrado);
        } else {
          setCampañaActiva(dataCampanias?.activa || null);
          const historialCrudo = Array.isArray(dataCampanias?.historial) ? dataCampanias.historial : [];
          setHistorial(historialCrudo.filter(c => c.activo === false));
        }

        let totalHormas = 0;
        let totalKgs = 0;
        let totalMovimientos = 0;

        if (resStock.ok) {
          const dataStock = await resStock.json();
          if (Array.isArray(dataStock)) {
            const stockActivo = dataStock.filter(s => s.activo === true);
            totalHormas = stockActivo.reduce((acc, curr) => acc + (curr.hormas || 0), 0);
            totalKgs = stockActivo.reduce((acc, curr) => acc + (curr.kgs || 0), 0);
          }
        }

        if (resMovimientos.ok) {
          const dataMovimientos = await resMovimientos.json();
          if (Array.isArray(dataMovimientos)) {
            totalMovimientos = dataMovimientos.length;
          }
        }

        setMetricas({
          movimientos: totalMovimientos,
          hormasStock: totalHormas,
          kgsStock: Number(totalKgs.toFixed(1))
        });

      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const abrirModalCerrar = () => {
    setModalCerrarAbierto(true);
  };

  const confirmarCierreCampaña = async ({ nombreNuevaCampaña, accionStock }) => {
    try {
      const bodyData = {
        id: campañaActiva?.id,
        nombre: nombreNuevaCampaña,
        desdeCero: accionStock === 'desde_cero',
        fechaInicio: '',
        fechaFin: '',
        cantMov: '',
        cantHormas: '',
        cantKilos: '',
      };
debugger;
      const response = await fetch(`${API_BASE}/campania/cerrar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al cerrar la campaña.');
      }

      setModalCerrarAbierto(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="campaña-page">
      <header className="campaña-topbar">
        <div className="campaña-topbar-actions">
          <button className="campaña-btn-volver" onClick={() => navigate('/inicio')}>
            ← Inicio
          </button>
          <button className="campaña-btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </header>

      <main className="campaña-documento">
        <div className="campaña-titulo-seccion">
          <span className="campaña-icono">📅</span>
          <h1>Gestión de campañas</h1>
        </div>

        {cargando ? (
          <div className="campaña-cargando">Cargando campañas...</div>
        ) : error ? (
          <div className="campaña-error">{error}</div>
        ) : (
          <>
            {/* CAMPAÑA ACTIVA */}
            <div className="campaña-card activa">
              <div className="campaña-card-header azul">
                <span>📁 Campaña activa (en curso)</span>
              </div>
              <div className="campaña-card-body">
                <div className="campaña-stats-grid">
                  <div className="campaña-stat-item">
                    <strong>{metricas.movimientos}</strong>
                    <span>Movimientos</span>
                  </div>
                  <div className="campaña-stat-item">
                    <strong>{metricas.hormasStock}</strong>
                    <span>Hormas en stock</span>
                  </div>
                  <div className="campaña-stat-item">
                    <strong>{metricas.kgsStock}</strong>
                    <span>Kgs en stock</span>
                  </div>
                </div>

                <div className="campaña-periodo">
                  Período: <strong>{formatearFecha(campañaActiva?.fechaInicio || '')}</strong> al <strong>{formatearFecha(campañaActiva?.fechaFin || '')}</strong>
                </div>

                <button className="campaña-btn-cerrar" onClick={abrirModalCerrar}>
                  🔒 Cerrar campaña y archivar
                </button>

                <p className="campaña-leyenda">
                  Al cerrar se archivan todos los datos y podés elegir si empezar desde cero o continuar con el stock actual.
                </p>
              </div>
            </div>

            {/* HISTORIAL DE CAMPAÑAS */}
            {/* HISTORIAL DE CAMPAÑAS */}
<div className="campaña-card historial">
  <div className="campaña-card-header verde">
    <span>📁 Historial de campañas archivadas ({historial.length})</span>
  </div>

  <div className="campaña-card-body campaña-tabla-container">
    {historial.length === 0 ? (
      <p className="campaña-vacio">
        No hay campañas archivadas todavía.
      </p>
    ) : (
      <table className="campaña-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Período</th>
            <th>Movim.</th>
            <th>Hormas</th>
            <th>Kgs</th>
            <th>Stock llevado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {historial.map((camp, idx) => (
            <tr key={camp.id || idx}>

              {/* NOMBRE */}
              <td>
                <strong>{camp.nombre || '-'}</strong>
              </td>

              {/* PERÍODO */}
              <td>
                {formatearFecha(camp.fechaInicio)}
                {' → '}
                {formatearFecha(camp.fechaFin)}
              </td>

              {/* MOVIMIENTOS */}
              <td>
                {camp.cantMov ?? 0}
              </td>

              {/* HORMAS */}
              <td>
                {camp.cantHormas ?? 0}
              </td>

              {/* KILOS */}
              <td>
                {camp.cantKilos ?? 0}
              </td>

              {/* STOCK LLEVADO */}
              <td>
                {camp.stockLlevado === true ? (
                  <span className="campaña-badge-stock">
                    Continúa
                  </span>
                ) : (
                  <span className="campaña-badge-stock no">
                    Desde cero
                  </span>
                )}
              </td>

              {/* ACCIONES */}
              <td>
                <div className="campaña-acciones">

                  <button
                    type="button"
                    className="campaña-btn-zip"
                    title="Descargar ZIP"
                    onClick={() => {
                      console.log('Descargar ZIP campaña:', camp.id);
                      // Acá después agregamos el endpoint de descarga
                    }}
                  >
                    🗜️ ZIP
                  </button>

                  <button
                    type="button"
                    className="campaña-btn-eliminar"
                    title="Eliminar campaña"
                    onClick={() => {
                      console.log('Eliminar campaña:', camp.id);
                      // Acá después agregamos el endpoint DELETE
                    }}
                  >
                    🗑
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>
          </>
        )}
      </main>

      {/* MODAL DE CIERRE DE CAMPAÑA */}
      <CerrarCampaña
        isOpen={modalCerrarAbierto}
        onClose={() => setModalCerrarAbierto(false)}
        onConfirm={confirmarCierreCampaña}
        nombreCampañaActual={campañaActiva?.nombre}
      />
    </div>
  );
};

export default GestionCampañas;