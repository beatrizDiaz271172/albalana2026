import React from 'react';
import { useNavigate } from 'react-router-dom';

const PanelReportes = () => {
    const navigate = useNavigate();

    // Configuración de los 4 botones/tarjetas estilo dashboard
    const botones = [
        {
            id: 'camara',
            titulo: 'Cámara',
            icono: '🏢',
            colorBorde: '#3b5998', // Azul corporativo
            ruta: '/definicionesSistemaCamara'
        },
        {
            id: 'cliente',
            titulo: 'Cliente',
            icono: '👥',
            colorBorde: '#6f42c1', // Morado / Violeta
            ruta: '/reportes/cliente'
        },
        {
            id: 'operador',
            titulo: 'Operador',
            icono: '🛡️',
            colorBorde: '#2e6b4d', // Verde oscuro (estilo Alba Lana)
            ruta: '/reportes/operador'
        },
        {
            id: 'producto',
            titulo: 'Producto',
            icono: '🧀',
            colorBorde: '#d9534f', // Rojo / Coral
            ruta: '/definicionesSistema' // Redirige a DefinicionesSistema
        }
    ];

    const estilosGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        padding: '0 20px 20px 20px',
        maxWidth: '1000px',
        margin: '0 auto'
    };

    const estTarjeta = (color) => ({
        backgroundColor: '#ffffff',
        border: `2px solid ${color}`,
        borderRadius: '12px',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        textAlign: 'center'
    });

    const estIcono = {
        fontSize: '2.5rem',
        marginBottom: '12px'
    };

    const estTexto = {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#333333',
        margin: 0
    };

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
                
                {/* Botones de navegación */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
                    <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
                </div>

                <h2 style={{ textAlign: 'center', color: '#2e6b4d', marginBottom: '30px', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    Seleccione Item a Definir
                </h2>
                
                <div style={estilosGrid}>
                    {botones.map((btn) => (
                        <div
                            key={btn.id}
                            style={estTarjeta(btn.colorBorde)}
                            onClick={() => navigate(btn.ruta)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                            }}
                        >
                            <span style={estIcono}>{btn.icono}</span>
                            <h3 style={estTexto}>{btn.titulo}</h3>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

// Estilo auxiliar reutilizable para los botones de navegación superior
const btnStyleLight = { 
    backgroundColor: '#e0e0e0', 
    color: '#333', 
    border: 'none', 
    padding: '8px 15px', 
    borderRadius: '4px', 
    fontWeight: '500', 
    cursor: 'pointer' 
};

export default PanelReportes;