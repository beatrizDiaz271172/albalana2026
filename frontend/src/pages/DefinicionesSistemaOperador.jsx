import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../Config';
import './DefinicionesSistema.css';
import { eliminarRegistro } from '../services/eliminar';

const DefinicionesSistemaOperador = () => {
    const navigate = useNavigate();

    const [operadores, setOperadores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [operadorActual, setOperadorActual] = useState({ id: null, nombre: '' });
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState(null);

    const authHeaders = () => {
        const token = localStorage.getItem('userToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

  const eliminarOperador = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al operador "${nombre}"?`)) return;
    const r = await eliminarRegistro('operadores', id);
    if (r.ok) await cargarOperadores(); else alert(r.mensaje);
  };
    const cargarOperadores = async () => {
        setCargando(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/operadores`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setOperadores(data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')));
            } else {
                setError('Error al cargar los operadores.');
            }
        } catch (err) {
            console.error('Error al cargar operadores:', err);
            setError('No se pudieron cargar los datos del servidor.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarOperadores();
    }, []);

    const abrirModalAgregar = () => {
        setOperadorActual({ id: null, nombre: '' });
        setModoEdicion(false);
        setErrorForm(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (operador) => {
        setOperadorActual({ id: operador.id, nombre: operador.nombre });
        setModoEdicion(true);
        setErrorForm(null);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setOperadorActual({ id: null, nombre: '' });
        setErrorForm(null);
    };

    const guardarOperador = async () => {
        if (!operadorActual.nombre || operadorActual.nombre.trim() === '') {
            setErrorForm('El nombre es obligatorio.');
            return;
        }

        setGuardando(true);
        setErrorForm(null);

        try {
            const payload = { nombre: operadorActual.nombre.trim() };
            const url = modoEdicion
                ? `${API_BASE}/operadores/${operadorActual.id}`
                : `${API_BASE}/operadores`;

            const res = await fetch(url, {
                method: modoEdicion ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await cargarOperadores();
                cerrarModal();
            } else {
                const errData = await res.json().catch(() => ({}));
                setErrorForm(errData.mensaje || 'No se pudo guardar el operador. Intente nuevamente.');
            }
        } catch (err) {
            console.error('Error al guardar operador:', err);
            setErrorForm('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    // Estilos (mismos que Cámara)
    const thStyle = {
        backgroundColor: '#2e6b4d', color: 'white', padding: '12px 16px', fontSize: '0.9rem',
        textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #1a4d2e'
    };
    const tdStyle = {
        padding: '12px 16px', fontSize: '0.9rem', textAlign: 'left',
        borderBottom: '1px solid #e5e7eb', color: '#374151'
    };
    const btnStyleLight = {
        backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '8px 15px',
        borderRadius: '4px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem'
    };
    const btnAgregar = {
        backgroundColor: '#2e6b4d', color: 'white', border: 'none', padding: '10px 18px',
        borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
        display: 'flex', alignItems: 'center', gap: '6px'
    };
    const btnEditar = {
        border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: '500',
        cursor: 'pointer', fontSize: '0.8rem', marginRight: '6px',
        backgroundColor: '#0275d8', color: 'white'
    };
    const btnEliminar = { ...btnEditar, backgroundColor: '#d9534f' };

    return (
        <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '40px' }}>

            <header style={{ backgroundColor: '#2e6b4d', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧀</span> Alba Lana
                </div>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>≡ Menú</button>
            </header>

            <main style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnStyleLight}>← Inicio</button>
                    <button onClick={() => navigate(-1)} style={btnStyleLight}>↰ Volver</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#2e6b4d', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', margin: 0 }}>
                        🛡️ Definiciones de Sistema - Operadores
                    </h2>
                    <button style={btnAgregar} onClick={abrirModalAgregar}>＋ Agregar</button>
                </div>

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
                                            ⏳ Cargando operadores...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#d9534f', fontWeight: 'bold' }}>
                                            ❌ {error}
                                        </td>
                                    </tr>
                                ) : operadores.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            📭 No hay operadores registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    operadores.map((op) => (
                                        <tr key={op.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={tdStyle}>{op.id}</td>
                                            <td style={{ ...tdStyle, fontWeight: '500' }}>{op.nombre}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <button style={btnEditar} onClick={() => abrirModalEditar(op)}>
                                                    ✏️ Editar
                                                </button>
                                                <button style={btnEliminar} onClick={() => eliminarOperador(op.id, op.nombre)}>🗑️ Eliminar</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

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
                            {modoEdicion ? '✏️ Editar Operador' : '＋ Agregar Operador'}
                        </h3>

                        {modoEdicion && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                                    ID (autonumérico)
                                </label>
                                <input
                                    type="text"
                                    value={operadorActual.id}
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
                                value={operadorActual.nombre}
                                onChange={(e) => setOperadorActual({ ...operadorActual, nombre: e.target.value })}
                                placeholder="Ej: Juan Pérez"
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
                                onClick={guardarOperador}
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

export default DefinicionesSistemaOperador;