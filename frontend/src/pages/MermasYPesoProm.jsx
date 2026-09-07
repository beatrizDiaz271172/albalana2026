import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://192.168.0.32:8081/api';

const MermasEstadisticasTabla = () => {
    const navigate = useNavigate();

    // Estados para los datos
    const [mermasData, setMermasData] = useState([]);
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

    // Cargar datos de Mermas Estadísticas desde Spring Boot
    useEffect(() => {
     const cargarMermas = async () => {
     setCargando(true);
     try {

     debugger;
     const [resMermas] = await Promise.all([
        fetch(`${API_BASE}/productos/mermas`, { headers: authHeaders() }) 
      ]);

       if (resMermas.ok) {
            const data = await resMermas.json();
            // Ordenar alfabéticamente por productoNombre
            const ordenados = Array.isArray(data) 
                  ? data.sort((a, b) => (a.productoNombre || '').localeCompare(b.productoNombre || ''))
                  : [];
            setMermasData(ordenados);
         } else {
            setError('Error al cargar los datos de mermas.');
         }
            } catch (err) {
                console.error('Error al cargar mermas:', err);
                setError('No se pudieron cargar los datos del servidor.');
            } finally {
                setCargando(false);
            }
        };

        cargarMermas();
    }, []);

    // Calcular totales
    const totales = React.useMemo(() => {
        if (mermasData.length === 0) {
            return {
                egresoKgsPpio: 0,
                egresoKgs: 0,
                mermaKgs: 0,
                mermaKgsPorc: 0
            };
        }

        const totalEgresoKgsPpio = mermasData.reduce((sum, row) => sum + (row.egresoKgsPpio || 0), 0);
        const totalEgresoKgs = mermasData.reduce((sum, row) => sum + (row.egresoKgs || 0), 0);
        const totalMermaKgs = mermasData.reduce((sum, row) => sum + (row.mermaKgs || 0), 0);
        const mermaPromedio = totalEgresoKgsPpio > 0 ? (totalMermaKgs / totalEgresoKgsPpio) * 100 : 0;

        return {
            egresoKgsPpio: totalEgresoKgsPpio.toFixed(2),
            egresoKgs: totalEgresoKgs.toFixed(2),
            mermaKgs: totalMermaKgs.toFixed(2),
            mermaKgsPorc: mermaPromedio.toFixed(1)
        };
    }, [mermasData]);

    // Estilos
    const thStyle = {
        backgroundColor: '#2e6b4d',
        color: 'white',
        padding: '12px 16px',
        fontSize: '0.9rem',
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottom: '2px solid #1a4d2e'
    };

    const thStyleLeft = {
        ...thStyle,
        textAlign: 'left'
    };

    const tdStyle = {
        padding: '12px 16px',
        fontSize: '0.9rem',
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb',
        color: '#374151'
    };

    const tdStyleLeft = {
        ...tdStyle,
        textAlign: 'left',
        fontWeight: '500'
    };

    const btnStyleLight = {
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '4px',
        fontWeight: '500',
        cursor: 'pointer',
        fontSize: '0.9rem'
    };

    return (
        <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px' }}>
            
            {/* Navbar Superior */}
            <header style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧀</span> Alba Lana
                </div>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>≡ Menú</button>
            </header>

            <main style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
                
                {/* Botones de navegación */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
                    <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
                </div>

                {/* Título */}
                <h2 style={{ color: '#2e6b4d', fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                    📊 Mermas y peso promedio por producto
                </h2>

                {/* Contenedor de la Tabla */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr>
                                    <th style={thStyleLeft}>Producto</th>
                                    <th style={thStyleLeft}>Lote</th>
                                    <th style={thStyle}>H.Egr</th>
                                    <th style={thStyle}>Kg.Ini*</th>
                                    <th style={thStyle}>Kg.Egr</th>
                                    <th style={thStyle}>Merma kg</th>
                                    <th style={thStyle}>Merma%</th>
                                    <th style={thStyle}>kg/H ini</th>
                                    <th style={thStyle}>kg/H fin</th>
                                    <th style={thStyle}>H.Stock</th>
                                    <th style={thStyle}>Kg.Stock estimado*</th>
                                    <th style={thStyle}>Merma stock*</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            ⏳ Cargando datos de mermas...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#d9534f', fontWeight: 'bold' }}>
                                            ❌ {error}
                                        </td>
                                    </tr>
                                ) : mermasData.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            📭 No hay datos de mermas disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {mermasData.map((row, index) => (
                                            <tr key={row.productoId || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={tdStyleLeft}>
                                                    {row.productoNombre}
                                                </td>
                                                <td style={tdStyleLeft}>
                                                    {row.cdCodigoLote}
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.egresoHormas?.toFixed(1) || '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.egresoKgsPpio?.toFixed(2) || '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.egresoKgs?.toFixed(2) || '—'}
                                                </td>
                                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                                                    {row.mermaKgs?.toFixed(2) || '—'}
                                                </td>
                                                <td style={{ ...tdStyle, color: '#d9534f', fontWeight: 'bold' }}>
                                                    {row.mermaKgsPorc?.toFixed(1) || '—'}%
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.pesoKgsXHormaIngreso?.toFixed(2) || '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.pesoKgsXHormaEgreso?.toFixed(2) || '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    {row.hormasStock?.toFixed(0) || '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ color: '#0275d8', fontWeight: 'bold' }}>
                                                        {row.kgsStockReal?.toFixed(2) || '—'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                                                        (stock: {row.kgsStockSinMerma?.toFixed(2) || '—'})
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ color: '#d9534f', fontWeight: 'bold' }}>
                                                        {row.mermaStock?.toFixed(2) || '—'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                                                        kgs. perdidos
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notas y Leyendas */}
                <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.6' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#2e6b4d' }}>📋 Definición de Campos:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div><strong>Kg.Ini*</strong> (egresoKgsPpio) = peso estimado al ingreso de las hormas que egresaron</div>
                        <div><strong>kg/H ini</strong> (pesoKgsXHormaIngreso) = peso promedio por horma al ingresar</div>
                        <div><strong>kg/H fin</strong> (pesoKgsXHormaEgreso) = peso promedio por horma al egresar</div>
                        <div><strong>Kg.Stock estimados*</strong> = kgs estimados de las hormas en cámara aplicando merma</div>
                        <div><strong>Merma stock*</strong> (mermaStock) = kg que probablemente perdieron las hormas en cámara</div>
                    </div>
                    <div style={{ color: '#d9534f', marginTop: '12px', fontStyle: 'italic' }}>
                        <strong>* Valores estimados</strong> — la merma real puede variar según el tiempo y condiciones de cada lote.
                    </div>
                </div>

            </main>
        </div>
    );
};

export default MermasEstadisticasTabla;
