import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstadoMaduracionLoteCamara.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const EstadoMaduracionLoteCamara = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [stocksConDetalles, setStocksConDetalles] = useState([]);

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');
    return { 'Authorization': `Bearer ${token}` };
  };
  const formatearFechaDisplay = (fechaISO) => {
      if (!fechaISO) return '';
          const [año, mes, dia] = fechaISO.split('-');
          return `${dia}/${mes}/${año}`;
      };

  // 1. Cargar stocks al montar
useEffect(() => {
  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Agregamos la petición de mermas al Promise.all
      const [resStock] = await Promise.all([
        fetch(`${API_BASE}/stock`, { headers: authHeaders() }) // 👈 Nueva petición
      ]);

      // 2. Procesamos las respuestas si el servidor respondió correctamente
      if (resStock.ok) setStocks(await resStock.json()); // 👈 Guardamos el estado de mermas
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  cargarDatos();
}, []);

  // 2. Procesar stocks y agregar detalles de maduración
  useEffect(() => {
    if (stocks.length > 0) {
       const stocksCalculados = stocks
        .filter((stock) => stock.activo === true) // Solo stocks activos
        .map((stock) => {
          // Obtener fechaElaboracion
          const fechaElaboracion = new Date(stock.lote?.fechaElaboracion);
          const hoy = new Date();

          // Calcular días transcurridos
          const diferenciaMilisegundos = hoy - fechaElaboracion;
          const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24)) + 1;

          // Calcular porcentaje de maduración
          const diasMaduracion = stock.lote?.producto?.maduracionDias || 1;
          const diasPreMaduracion = stock.lote?.producto?.preMaduracionDias ||7;
         // alert("Dias Pre Maduracion: " + diasPreMaduracion);
          const porcentajeMaduracion = Math.min(100, (diasTranscurridos / diasMaduracion) * 100);

          // Obtener stock mínimo
          const stockMinimo = stock.lote?.producto?.stockMinimo || 0;



          return {
            ...stock,
            loteCode: stock.lote?.codigo || 'N/A',
            productoNombre: stock.lote?.producto?.nombre || 'N/A',
            fechaElaboracion: stock.lote?.fechaElaboracion || '',
            camaraNombre: stock.lote?.camara?.nombre || 'N/A',
            hormas: stock.hormas || 0,
            diasTranscurridos,
            stockMinimo,
            porcentajeMaduracion,
            diasMaduracion,
            maduroCompleto: diasTranscurridos >= diasMaduracion,
            diasPasaron: diasMaduracion - diasTranscurridos,
            preMaduro: 0 < diasMaduracion - diasTranscurridos && diasMaduracion - diasTranscurridos <= diasPreMaduracion
          };
        })
        .sort((a, b) => {
          // Ordenar por: Lote, Cámara, Producto
          if (a.loteCode !== b.loteCode) {
            return (a.loteCode || '').localeCompare(b.loteCode || '');
          }
          if (a.camaraNombre !== b.camaraNombre) {
            return (a.camaraNombre || '').localeCompare(b.camaraNombre || '');
          }
          return (a.productoNombre || '').localeCompare(b.productoNombre || '');
        });

      setStocksConDetalles(stocksCalculados);
    }
  }, [stocks]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Obtener color de barra según progreso
  const getColorProgreso = (porcentaje) => {
    if (porcentaje < 50) return '#ffc107'; // Amarillo
    if (porcentaje < 80) return '#17a2b8'; // Azul
    if (porcentaje < 100) return '#28a745'; // Verde
    return '#5cb85c'; // Verde oscuro (maduro)
  };

  return (

<div className="maduracion-page">
      {/* Navbar Superior */}
      <header className="navbar-maduracion">
        <div className="navbar-brand-maduracion">
          <span className="brand-icon">🧀</span>
          <span className="brand-title">Alba Lana</span>
        </div>
        <button className="btn-menu-maduracion">≡ Menú</button>
      </header>

      <main className="maduracion-container">
        {/* Navegación superior */}
        <div className="nav-actions-maduracion">
          <button className="btn-nav-top-maduracion" onClick={() => navigate('/dashboard')}>
            ← Inicio
          </button>
          <button className="btn-nav-top-maduracion" onClick={() => navigate(-1)}>
            ↰ Volver
          </button>
        </div>

        {/* Título principal */}
        <h2 className="screen-title-maduracion">
          <span className="title-icon">📊</span> Estado de maduración - Lotes por cámara
        </h2>

        {/* Tabla de stocks */}
        {cargando ? (
          <div className="card-maduracion">
            <p style={{ textAlign: 'center', color: '#666' }}>Cargando datos...</p>
          </div>
        ) : stocksConDetalles.length === 0 ? (
          <div className="card-maduracion">
            <p style={{ textAlign: 'center', color: '#999' }}>
              No hay stocks activos para mostrar
            </p>
          </div>
        ) : (
          <div className="card-maduracion tabla-container">
            <table className="tabla-maduracion">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Producto</th>
                  <th>Fecha Elaboración</th>
                  <th>Cámara</th>
                  <th>H</th>
                  <th>Días</th>
                  <th>Min</th>
                  <th>Progreso (%)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stocksConDetalles.map((stock, idx) => (
                  <tr key={idx} className={stock.maduroCompleto ? 'fila-maduro' : ''}>
                    {/* Lote */}
                    <td className="celda-lote">
                      <strong>{stock.loteCode}</strong>
                    </td>

                    {/* Producto */}
                    <td className="celda-producto">
                      {stock.productoNombre}
                    </td>

                    {/* Fecha Elaboración */}
                    <td className="celda-fecha">
                      {formatearFechaDisplay(stock.fechaElaboracion)}
                    </td>

                    {/* Cámara */}
                    <td className="celda-camara">
                      <strong>{stock.camaraNombre}</strong>                  
                    </td>

                    {/* Hormas (H) */}
                    <td className="celda-hormas">
                      {stock.hormas.toFixed(2)}
                    </td>

                    {/* Días transcurridos */}
                    <td className="celda-dias">
                      <strong>{stock.diasTranscurridos}</strong>
                    </td>

                    {/* Stock Mínimo */}
                    <td className="celda-minimo">
                      {stock.stockMinimo}
                    </td>

                    {/* Barra de Progreso */}
                    <td className="celda-progreso">
                      <div className="progreso-container">
                        <div className="progreso-barra">
                          <div
                            className="progreso-relleno"
                            style={{
                              width: `${stock.porcentajeMaduracion}%`,
                              backgroundColor: getColorProgreso(stock.porcentajeMaduracion)
                            }}
                          ></div>
                        </div>
                        <span className="progreso-texto">
                          {stock.porcentajeMaduracion.toFixed(0)}%
                        </span>
                      </div>
                      <span className="dias-maduracion">
                        {stock.diasTranscurridos}/{stock.diasMaduracion} días
                      </span>
                    </td>

                   {/* Estado */}
<td className="celda-estado">
  {stock.maduroCompleto ? (
    <span className="badge-estado maduro">✓ Maduro</span>
  ) : (
    stock.preMaduro ? (
      <span className="badge-estado maduro">⚡ Prox a estar Listo</span>
    ) : (
      <span className="badge-estado en-maduracion">En maduración</span>
    )
  )}
</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen */}
        {stocksConDetalles.length > 0 && (
          <div className="resumen-maduracion">
            <div className="resumen-item">
              <span className="resumen-numero">{stocksConDetalles.length}</span>
              <span className="resumen-label">Lotes activos</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-numero">
                {stocksConDetalles.filter((s) => s.maduroCompleto).length}
              </span>
              <span className="resumen-label">Maduros</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-numero">
                {stocksConDetalles.filter((s) => !s.maduroCompleto).length}
              </span>
              <span className="resumen-label">En maduración</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EstadoMaduracionLoteCamara;
