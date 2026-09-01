import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://192.168.0.32:8081/api';

const DefinicionesSistemaCamara = () => {
    const navigate = useNavigate();

    // Estados para los datos
    const [camaras, setCamaras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal (Agregar / Editar)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [camaraActual, setCamaraActual] = useState({ id: null, nombre: '' });
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState(null);

    // Cabecera de autenticación con Bearer Token
    const authHeaders = () => {
        const token = localStorage.getItem('userToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Cargar cámaras desde Spring Boot
    const cargarCamaras = async () => {
        setCargando(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/camaras`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                const ordenados = data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                setCamaras(ordenados);
            } else {
                setError('Error al cargar las cámaras.');
            }
        } catch (err) {
            console.error('Error al cargar cámaras:', err);
            setError('No se pudieron cargar los datos del servidor.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCamaras();
    }, []);

    // Abrir modal para Agregar (id no se carga, es autonumérico)
    const abrirModalAgregar = () => {
        setCamaraActual({ id: null, nombre: '' });
        setModoEdicion(false);
        setErrorForm(null);
        setModalAbierto(true);
    };

    // Abrir modal para Editar
    const abrirModalEditar = (camara) => {
        setCamaraActual({ id: camara.id, nombre: camara.nombre });
        setModoEdicion(true);
        setErrorForm(null);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCamaraActual({ id: null, nombre: '' });
        setErrorForm(null);
    };

    // Guardar (Crear o Actualizar)
    const guardarCamara = async () => {
        if (!camaraActual.nombre || camaraActual.nombre.trim() === '') {
            setErrorForm('El nombre es obligatorio.');
            return;
        }

        setGuardando(true);
        setErrorForm(null);
        debugger;

        try {
            const payload = { nombre: camaraActual.nombre.trim() };

            const url = modoEdicion
                ? `${API_BASE}/camaras/${camaraActual.id}`
                : `${API_BASE}/camaras`;

            const metodo = modoEdicion ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: metodo,
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await cargarCamaras();
                cerrarModal();
            } else {
               debugger;
                setErrorForm('No se pudo guardar la cámara. Intente nuevamente.');
            }
        } catch (err) {
            console.error('Error al guardar cámara:', err);
            setErrorForm('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    // Eliminar cámara
    const eliminarCamara = async (id, nombre) => {
        if (!window.confirm(`¿Está seguro que desea eliminar la cámara "${nombre}"?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/camaras/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (res.ok) {
                await cargarCamaras();
            } else {
                alert('No se pudo eliminar la cámara.');
            }
        } catch (err) {
            console.error('Error al eliminar cámara:', err);
            alert('Error de conexión con el servidor.');
        }
    };

    // Estilos
    const thStyle = {
        backgroundColor: '#2e6b4d',
        color: 'white',
        padding: '12px 16px',
        fontSize: '0.9rem',
        textAlign: 'left',
        fontWeight: 'bold',
        borderBottom: '2px solid #1a4d2e'
    };

    const tdStyle = {
        padding: '12px 16px',
        fontSize: '0.9rem',
        textAlign: 'left',
        borderBottom: '1px solid #e5e7eb',
        color: '#374151'
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

    const btnAgregar = {
        backgroundColor: '#2e6b4d',
        color: 'white',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    };

    const btnAccion = {
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        fontWeight: '500',
        cursor: 'pointer',
        fontSize: '0.8rem',
        marginRight: '6px'
    };

    const btnEditar = { ...btnAccion, backgroundColor: '#0275d8', color: 'white' };
    const btnEliminar = { ...btnAccion, backgroundColor: '#d9534f', color: 'white' };

    return (
        <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px' }}>

            {/* Navbar Superior */}
            <header style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧀</span> Alba Lana
                </div>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>≡ Menú</button>
            </header>

            <main style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>

                {/* Botones de navegación */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
                    <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
                </div>

                {/* Título + botón Agregar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#2e6b4d', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', margin: 0 }}>
                        ❄️ Definiciones de Sistema - Cámaras
                    </h2>
                    <button style={btnAgregar} onClick={abrirModalAgregar}>
                        ＋ Agregar
                    </button>
                </div>

                {/* Contenedor de la Tabla */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, width: '80px' }}>ID</th>
                                    <th style={thStyle}>Nombre</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '180px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            ⏳ Cargando cámaras...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#d9534f', fontWeight: 'bold' }}>
                                            ❌ {error}
                                        </td>
                                    </tr>
                                ) : camaras.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            📭 No hay cámaras registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    camaras.map((cam) => (
                                        <tr key={cam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={tdStyle}>{cam.id}</td>
                                            <td style={{ ...tdStyle, fontWeight: '500' }}>{cam.nombre}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <button style={btnEditar} onClick={() => abrirModalEditar(cam)}>
                                                    ✏️ Editar
                                                </button>
                                                <button style={btnEliminar} onClick={() => eliminarCamara(cam.id, cam.nombre)}>
                                                    🗑️ Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Agregar / Editar */}
            {modalAbierto && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}
                    onClick={cerrarModal}
                >
                    <div
                        style={{
                            backgroundColor: 'white', borderRadius: '8px', padding: '25px',
                            width: '90%', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ color: '#2e6b4d', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
                            {modoEdicion ? '✏️ Editar Cámara' : '＋ Agregar Cámara'}
                        </h3>

                        {modoEdicion && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                                    ID (autonumérico)
                                </label>
                                <input
                                    type="text"
                                    value={camaraActual.id}
                                    disabled
                                    style={{
                                        width: '100%', padding: '8px 10px', borderRadius: '4px',
                                        border: '1px solid #d1d5db', backgroundColor: '#f3f4f6',
                                        color: '#9ca3af', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '4px', fontWeight: '500' }}>
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={camaraActual.nombre}
                                onChange={(e) => setCamaraActual({ ...camaraActual, nombre: e.target.value })}
                                placeholder="Ej: Cámara 1"
                                autoFocus
                                style={{
                                    width: '100%', padding: '8px 10px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        {errorForm && (
                            <div style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '10px' }}>
                                ⚠️ {errorForm}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button
                                style={{ ...btnStyleLight, padding: '8px 16px' }}
                                onClick={cerrarModal}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                style={{ ...btnAgregar, opacity: guardando ? 0.6 : 1 }}
                                onClick={guardarCamara}
                                disabled={guardando}
                            >
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DefinicionesSistemaCamara;
