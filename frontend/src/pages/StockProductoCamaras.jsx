import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://192.168.0.32:8081/api'; 

const StockActualProductoCama = () => {
    const navigate = useNavigate();

    // Estados para los datos
    const [stocks, setStocks] = useState([]);
    const [camaras, setCamaras] = useState([]);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Cabecera de autenticación con Bearer Token (siguiendo tu referencia)
    const authHeaders = () => {
        const token = localStorage.getItem('userToken');
        return { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Cargar datos iniciales en paralelo desde Spring Boot
    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            try {
                const [resStocks, resCamaras, resProductos] = await Promise.all([
                    fetch(`${API_BASE}/stock`, { headers: authHeaders() }),
                    fetch(`${API_BASE}/camaras`, { headers: authHeaders() }),
                    fetch(`${API_BASE}/productos`, { headers: authHeaders() })
                ]);

                if (resStocks.ok) setStocks(await resStocks.json());
                if (resCamaras.ok) {
                    const data = await resCamaras.json();
                    const ordenados = data.sort((a, b) =>(a.nombre || '').localeCompare(b.nombre || ''));
                    setCamaras(ordenados);
                }
                if (resProductos.ok) setProductos(await resProductos.json());

            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudieron cargar los datos del servidor.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    // Procesamiento y agrupación de datos por Producto y Cámara
    const datosTabla = React.useMemo(() => {
        const map = {};

        // 1. Inicializar con todos los productos para asegurar que aparezcan en la tabla
        productos.forEach(prod => {
            map[prod.id] = {
                id: prod.id,
                nombre: prod.nombre,
                camarasData: {}, // { camaraId: { hormas, kgs } }
                totalH: 0,
                totalKg: 0
            };
        });

        // 2. Filtrar y acumular stock según las reglas de negocio solicitadas:
        // Stock.activo = true && Stock.lote.activo = true && Stock.lote.camara.activo = true
        stocks.forEach(stock => {
            const lote = stock.lote;
            const camara = lote?.camara;
            const producto = lote?.producto;

            const camaraActiva = camara?.activo === true || camara?.activo === undefined;

            if (
                stock.activo === true &&
                lote &&
                lote.activo === true &&
                camaraActiva &&
                producto
            ) {
                const prodId = producto.id;
                const camId = camara.id;

                // Si un producto con stock no estaba en la lista general, lo agregamos dinámicamente
                if (!map[prodId]) {
                    map[prodId] = {
                        id: prodId,
                        nombre: producto.nombre,
                        camarasData: {},
                        totalH: 0,
                        totalKg: 0
                    };
                }

                if (!map[prodId].camarasData[camId]) {
                    map[prodId].camarasData[camId] = { hormas: 0, kgs: 0 };
                }

                // Sumar valores por cámara
                map[prodId].camarasData[camId].hormas += (stock.hormas || 0);
                map[prodId].camarasData[camId].kgs += (stock.kgs || 0);

                // Totales globales por producto
                map[prodId].totalH += (stock.hormas || 0);
                map[prodId].totalKg += (stock.kgs || 0);
            }
        });

        return Object.values(map);
    }, [stocks, productos]);

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
            
            {/* Navbar Superior */}
            <header style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧀</span> Alba Lana
                </div>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>≡ Menú</button>
            </header>

            <main style={{ maxWidth: '1300px', margin: '20px auto', padding: '0 20px' }}>
                
                {/* Botones de navegación (Basado en HistorialMovimientos) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
                    <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
                </div>

                <h2 style={{ color: '#2e6b4d', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    📦 Stock actual por producto y cámara
                </h2>

                {/* Card Contenedor de la Tabla */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#2e6b4d', color: 'white' }}>
                                    <th style={{ padding: '12px 16px' }}>Producto</th>
                                    {/* Encabezado dinámico de Cámaras */}
                                    {camaras.map(cam => (
                                        <th key={cam.id} style={{ padding: '12px 16px', textAlign: 'center' }}>{cam.nombre}</th>
                                    ))}
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total H</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total kg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={camaras.length + 4} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                            Cargando información de stock...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={camaras.length + 4} style={{ textAlign: 'center', padding: '30px', color: '#d9534f' }}>
                                            {error}
                                        </td>
                                    </tr>
                                ) : datosTabla.length === 0 ? (
                                    <tr>
                                        <td colSpan={camaras.length + 4} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                            No hay registros de stock disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    datosTabla.map((prod, index) => (
                                        <tr key={prod.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '500', color: '#374151' }}>
                                                {prod.nombre}
                                            </td>
                                            
                                            {/* Celdas dinámicas para cada Cámara */}
                                            {camaras.map(cam => {
                                                const camData = prod.camarasData[cam.id];
                                                return (
                                                    <td key={cam.id} style={{ padding: '12px 16px', textAlign: 'center', color: '#4b5563' }}>
                                                        {camData ? `${camData.hormas}H / ${camData.kgs.toFixed(1)}kg` : '—'}
                                                    </td>
                                                );
                                            })}

                                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', color: '#111827' }}>
                                                {prod.totalH}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#4b5563' }}>
                                                {prod.totalKg.toFixed(1)}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                {/* Estado dejado en blanco según requerimiento */}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Estilos auxiliares reutilizables
const btnStyleLight = { 
    backgroundColor: '#e0e0e0', 
    color: '#333', 
    border: 'none', 
    padding: '8px 15px', 
    borderRadius: '4px', 
    fontWeight: '500', 
    cursor: 'pointer' 
};

export default StockActualProductoCama;