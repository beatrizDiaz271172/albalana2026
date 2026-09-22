import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CerrarCampania from './CerrarCampania';
import './GestionCampanias.css';
import { API_BASE } from '../Config'; 

const GestionCampanias = () => {
  const navigate = useNavigate();
  const [CampaniaActiva, setCampaniaActiva] = useState(null);
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
          throw new Error('No se pudo obtener la información de las Campanias.');
        }

        const dataCampanias = await resCampanias.json();

        if (Array.isArray(dataCampanias)) {
          const activaEncontrada = dataCampanias.find(c => c.activo === true) || null;
          const historialFiltrado = dataCampanias.filter(c => c.activo === false);
          debugger;
          setCampaniaActiva(activaEncontrada);
          setHistorial(historialFiltrado);
        } else {
          setCampaniaActiva(dataCampanias?.activa || null);
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

  const confirmarCierreCampania = async ({ nombreNuevaCampania, accionStock }) => {
    try {
      const bodyData = {
        id: CampaniaActiva?.id,
        nombre: nombreNuevaCampania,
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
        throw new Error(errorText || 'Error al cerrar la Campania.');
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
    <div className="Campania-page">
      <header className="Campania-topbar">
        <div className="Campania-topbar-actions">
          <button className="Campania-btn-volver" onClick={() => navigate('/inicio')}>
            ← Inicio
          </button>
          <button className="Campania-btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </header>

      <main className="Campania-documento">
        <div className="Campania-titulo-seccion">
          <span className="Campania-icono">📅</span>
          <h1>Gestión de Campanias</h1>
        </div>

        {cargando ? (
          <div className="Campania-cargando">Cargando Campanias...</div>
        ) : error ? (
          <div className="Campania-error">{error}</div>
        ) : (
          <>
            {/* Campania ACTIVA */}
            <div className="Campania-card activa">
              <div className="Campania-card-header azul">
                <span>📁 Campania activa (en curso)</span>
              </div>
              <div className="Campania-card-body">
                <div className="Campania-stats-grid">
                  <div className="Campania-stat-item">
                    <strong>{metricas.movimientos}</strong>
                    <span>Movimientos</span>
                  </div>
                  <div className="Campania-stat-item">
                    <strong>{metricas.hormasStock}</strong>
                    <span>Hormas en stock</span>
                  </div>
                  <div className="Campania-stat-item">
                    <strong>{metricas.kgsStock}</strong>
                    <span>Kgs en stock</span>
                  </div>
                </div>

                <div className="Campania-periodo">
                  Período: <strong>{formatearFecha(CampaniaActiva?.fechaInicio || '')}</strong> al <strong>{formatearFecha(CampaniaActiva?.fechaFin || '')}</strong>
                </div>

                <button className="Campania-btn-cerrar" onClick={abrirModalCerrar}>
                  🔒 Cerrar Campania y archivar
                </button>

                <p className="Campania-leyenda">
                  Al cerrar se archivan todos los datos y podés elegir si empezar desde cero o continuar con el stock actual.
                </p>
              </div>
            </div>

            {/* HISTORIAL DE CampaniaS */}
            {/* HISTORIAL DE CampaniaS */}
<div className="Campania-card historial">
  <div className="Campania-card-header verde">
    <span>📁 Historial de Campanias archivadas ({historial.length})</span>
  </div>

  <div className="Campania-card-body Campania-tabla-container">
    {historial.length === 0 ? (
      <p className="Campania-vacio">
        No hay Campanias archivadas todavía.
      </p>
    ) : (
      <table className="Campania-tabla">
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
                  <span className="Campania-badge-stock">
                    Continúa
                  </span>
                ) : (
                  <span className="Campania-badge-stock no">
                    Desde cero
                  </span>
                )}
              </td>

              {/* ACCIONES */}
              <td>
                <div className="Campania-acciones">

                  <button
                    type="button"
                    className="Campania-btn-zip"
                    title="Descargar ZIP"
                    onClick={() => {
                      console.log('Descargar ZIP Campania:', camp.id);
                      // Acá después agregamos el endpoint de descarga
                    }}
                  >
                    🗜️ ZIP
                  </button>

                  <button
                    type="button"
                    className="Campania-btn-eliminar"
                    title="Eliminar Campania"
                    onClick={() => {
                      console.log('Eliminar Campania:', camp.id);
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

      {/* MODAL DE CIERRE DE Campania */}
      <CerrarCampania
        isOpen={modalCerrarAbierto}
        onClose={() => setModalCerrarAbierto(false)}
        onConfirm={confirmarCierreCampania}
        nombreCampaniaActual={CampaniaActiva?.nombre}
      />
    </div>
  );
};

export default GestionCampanias;