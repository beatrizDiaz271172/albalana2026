import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ConsultarItemsRemito.css';

const API_BASE = 'http://192.168.0.32:8081/api';

const ConsultarItemsRemito = () => {
  const navigate = useNavigate();
  const { remitoId } = useParams();

  const [items, setItems] = useState([]);
  const [remito, setRemito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('userToken');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (!remitoId) return;

    const cargarDatos = async () => {
      setCargando(true);
      setError('');

      try {
        // ---------------------------------------------------------
        // ÍTEMS DEL REMITO
        // ---------------------------------------------------------
        const responseItems = await fetch(
          `${API_BASE}/remitos/${remitoId}/items`,
          {
            headers: authHeaders()
          }
        );

        if (!responseItems.ok) {
          throw new Error('No se pudieron obtener los ítems del remito.');
        }

        debugger;
        const dataItems = await responseItems.json();
        console.log('ITEMS DEL REMITO:', dataItems);

        setItems(Array.isArray(dataItems) ? dataItems : []);

        // ---------------------------------------------------------
        // DATOS GENERALES DEL REMITO
        // ---------------------------------------------------------
        // Si tu backend tiene este endpoint, se utilizan sus datos.
        // Si no existe, la pantalla continúa funcionando con los
        // datos disponibles en los ítems.
        try {
          const responseRemito = await fetch(
            `${API_BASE}/remitos/${remitoId}`,
            {
              headers: authHeaders()
            }
          );

          if (responseRemito.ok) {
            const dataRemito = await responseRemito.json();
            setRemito(dataRemito);
          }
        } catch (e) {
          console.warn('No se pudieron cargar los datos generales del remito.');
        }

      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al cargar el remito.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [remitoId]);

  // =============================================================
  // FUNCIONES AUXILIARES
  // =============================================================


  const formatearFecha = (fechaISO) => {
      if (!fechaISO) return '';
          const [año, mes, dia] = fechaISO.split('-');
          return `${dia}/${mes}/${año}`;
  };

  const formatearFechaBea = (fecha) => {
    if (!fecha) return '--/--/----';

    try {
      const fechaObj = new Date(fecha);

      if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
      }

      return fechaObj.toLocaleDateString('es-AR');
    } catch {
      return fecha;
    }
  };

  const obtenerNombreProducto = (item) => {
    return (
      item?.lote?.producto?.nombre ||
      item?.producto?.nombre ||
      item?.productoNombre ||
      'Sin producto'
    );
  };

  const obtenerCodigoLote = (item) => {
    return (
      item?.lote?.codigo ||
      item?.loteCodigo ||
      item?.codigoLote ||
      'N/A'
    );
  };

  const obtenerCamara = (item) => {
    return (
      item?.lote?.camara?.nombre ||
      item?.camara?.nombre ||
      item?.camaraNombre ||
      'N/A'
    );
  };

  const obtenerHormas = (item) => {
    return Number(item?.hormas || 0);
  };

  const obtenerKilos = (item) => {
    return Number(item?.kgs || item?.kilos || 0);
  };

  // =============================================================
  // TOTAL
  // =============================================================

  const totalHormas = items.reduce(
    (total, item) => total + obtenerHormas(item),
    0
  );

  const totalKilos = items.reduce(
    (total, item) => total + obtenerKilos(item),
    0
  );

  // =============================================================
  // DATOS GENERALES
  // =============================================================

  const numeroRemito = `MOV-${String(remitoId).padStart(4, '0')}`;

  const cliente =
    remito?.cliente?.nombre;

  const operador =
    remito?.operador?.nombre || 'N/A';

  const fechaEgreso =
    remito?.fechaEgreso;

  // =============================================================
  // IMPRIMIR
  // =============================================================

  const imprimirPDF = () => {
    window.print();
  };

  // =============================================================
  // RENDER
  // =============================================================

  return (
    <div className="remito-page">

      {/* =====================================================
          BARRA SUPERIOR
      ====================================================== */}
      <header className="remito-topbar">

        <div className="remito-topbar-title">
          <span className="remito-topbar-icon">🧀</span>
          Remito {numeroRemito} — {cliente}
        </div>

        <div className="remito-topbar-actions">

          <button
            className="remito-btn-volver"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>

          <button
            className="remito-btn-print"
            onClick={imprimirPDF}
          >
            🖨 Imprimir / PDF
          </button>

        </div>

      </header>

      {/* =====================================================
          DOCUMENTO
      ====================================================== */}
      <main className="remito-documento">

        {/* ===================================================
            ENCABEZADO
        ==================================================== */}
        <section className="remito-header">

          <div className="remito-empresa">

            <h1>Alba Lana</h1>

            <div>
              Ruta Provincial N° 36, Km 91
              Roberto J. Payro
              | Magdalena Provincia de Bs. As.
            </div>

            <div>
              Tel: (02221) 54-2006
            </div>

            <div>
              SENASA N° RNPA
            </div>

          </div>

          <div className="remito-identificacion">

            <span>N° REMITO</span>

            <strong>{numeroRemito}</strong>

            <small>
              {formatearFecha(fechaEgreso)}
            </small>

          </div>

        </section>

        {/* ===================================================
            LÍNEA VERDE
        ==================================================== */}
        <div className="remito-separador" />

        {/* ===================================================
            DATOS GENERALES
        ==================================================== */}
        <section className="remito-datos-grid">

          <div className="remito-dato">

            <span>CLIENTE</span>

            <strong>{cliente}</strong>

          </div>

          <div className="remito-dato">

            <span>FECHA DE EGRESO</span>

            <strong>
              {formatearFecha(fechaEgreso)}
            </strong>

          </div>

          <div className="remito-dato">

            <span>OPERARIO RESPONSABLE</span>

            <strong>{operador}</strong>

          </div>

          <div className="remito-dato">

            <span>TOTAL DEL REMITO</span>

            <strong>
              {totalHormas} hormas · {totalKilos.toFixed(1)} kg
            </strong>

          </div>

        </section>

        {/* ===================================================
            DETALLE DE PRODUCTOS
        ==================================================== */}
        <section className="remito-seccion">

          <h2>DETALLE DE PRODUCTOS</h2>

          {cargando ? (

            <div className="remito-cargando">
              Cargando remito...
            </div>

          ) : error ? (

            <div className="remito-error">
              {error}
            </div>

          ) : (

            <div className="remito-tabla-wrapper">

              <table className="remito-tabla">

                <thead>

                  <tr>
                    <th>Producto</th>
                    <th>Lote</th>
                    <th>Cámara</th>
                    <th>Hormas</th>
                    <th>Kgs</th>
                    <th>Madurez al egreso</th>
                    <th>Consumir antes de</th>
                  </tr>

                </thead>

                <tbody>

                  {items.length === 0 ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="remito-vacio"
                      >
                        No se encontraron ítems para este remito.
                      </td>
                    </tr>

                  ) : (

                    items.map((item, index) => {

                      const kilos = obtenerKilos(item);

                      /*
                       * Intentamos diferentes nombres de propiedades
                       * para que sea compatible con tu backend.
                       */

                      const diasMaduracion =
                        item?.diasMaduracionRem;

                      const diasMaduracionProd =
                        item?.diasMaduracionProd;

                      const fechaConsumo =
                        item?.fechaConsumoPreferente;

                      return (

                        <tr
                          key={item?.id || index}
                        >

                          <td className="producto-principal">
                            {obtenerNombreProducto(item)}
                          </td>

                          <td>
                            {obtenerCodigoLote(item)}
                          </td>

                          <td>
                            {obtenerCamara(item)}
                          </td>

                          <td className="numero">
                            {obtenerHormas(item)}
                          </td>

                          <td className="numero">
                            {kilos.toFixed(2)}
                          </td>

                          <td className="madurez">

                            <div className="madurez-contenedor">

                              <div className="madurez-barra">

                                <div
                                  className="madurez-progreso"
                                  style={{
                                    width: diasMaduracion
                                      ? `${Math.min(
                                          Number(diasMaduracion) * 100 / Number(diasMaduracionProd),
                                          100
                                        )}%`
                                      : '35%'
                                  }}
                                />

                              </div>

                              <span>
                                {diasMaduracion !== null
                                  ? `${diasMaduracion} días`
                                  : 'En maduración'}
                              </span>

                            </div>

                          </td>

                          <td className="fecha-consumo">

                            {fechaConsumo
                              ? formatearFecha(fechaConsumo)
                              : '--/--/----'}

                          </td>

                        </tr>

                      );
                    })

                  )}

                </tbody>

                {/* =========================================
                    TOTAL
                ========================================== */}
                {items.length > 0 && (

                  <tfoot>

                    <tr>

                      <td
                        colSpan="3"
                        className="total-label"
                      >
                        TOTAL
                      </td>

                      <td className="numero total">
                        {totalHormas}
                      </td>

                      <td className="numero total">
                        {totalKilos.toFixed(2)}
                      </td>

                      <td colSpan="2" />

                    </tr>

                  </tfoot>

                )}

              </table>

            </div>

          )}

        </section>

        {/* ===================================================
            DATOS DE ELABORACIÓN POR LOTE
        ==================================================== */}
        <section className="remito-seccion elaboracion">

          <h2>DATOS DE ELABORACIÓN POR LOTE</h2>

          {items.map((item, index) => { 
            const lote = item?.lote;

            if (!lote) return null;

            const producto = obtenerNombreProducto(item);

            const codigoLote = obtenerCodigoLote(item);

            const camara = obtenerCamara(item);

            debugger;
            const fechaElaboracion =item.lote.fechaElaboracion;

            const litrosLeche =
              lote?.litrosLeche ||
              lote?.litros ||
              item?.litrosLeche;

            debugger;
            const faltanDias = item.diasMaduracionProd - item.diasMaduracionRem;

            const fechaConsumo = item.fechaConsumoPreferente;

            return (

              <div
                className="lote-card"
                key={lote?.id || index}
              >

                {/* CABECERA DEL LOTE */}
                <div className="lote-header">

                  <strong>
                    {producto}
                  </strong>

                  <span>
                    {codigoLote}
                    {' · '}
                    {obtenerKilos(item).toFixed(2)} kg
                    {' · '}
                    {camara}
                  </span>

                </div>

                <div className="lote-contenido">

                  {/* COLUMNA 1 */}
                  <div className="lote-columna">

                    <span>FECHA DE ELABORACIÓN</span>

                    <strong>
                      {formatearFecha(fechaElaboracion)}
                    </strong>

                    <span>MADURACIÓN</span>

                    <strong>
                      {item.diasMaduracionProd
                        ? `${item.diasMaduracionProd} días`
                        : 'N/A'}
                    </strong>

                  </div>

                  {/* COLUMNA 2 */}
                  <div className="lote-columna">

                    <span>LITROS DE LECHE</span>

                    <strong>
                      {litrosLeche
                        ? `${litrosLeche} L`
                        : 'N/A'}
                    </strong>

                    <span>DÍAS EN CÁMARA AL EGRESO</span>

                    <strong>
                      {
                      item.diasMaduracionRem
                        ? `${item.diasMaduracionRem} días`
                        : 'N/A'}
                    </strong>

                  </div>

                  {/* COLUMNA 3 */}
                  <div className="lote-columna lote-columna-destacada">

                    <span>
                      CONSUMIR PREFERENTEMENTE ANTES DE
                    </span>

                    <strong>
                      {formatearFecha(fechaConsumo)}
                    </strong>

                    <span>ESTADO AL EGRESO</span>

                    <strong className="estado-maduracion">
                      {faltanDias >0                 
                        ? `En maduración, faltan ${faltanDias} días`
                        : `Ya maduró hace ${(-1) * faltanDias} días`}
                    </strong>

                  </div>

                </div>

              </div>

            );

          })}

        </section>

        {/* ===================================================
            FIRMAS
        ==================================================== */}
        <section className="remito-firmas">

          <div className="firma">

            <div className="firma-linea" />

            <span>
              Firma y aclaración — Alba Lana
            </span>

          </div>

          <div className="firma">

            <div className="firma-linea" />

            <span>
              Firma y aclaración — {cliente}
            </span>

          </div>

        </section>

      </main>

    </div>
  );
};

export default ConsultarItemsRemito;