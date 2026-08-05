import React, { useState, useEffect } from 'react';
import { fetchUsuarios, crearUsuario } from '../services/api';

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !email) return;

    try {
      const nuevo = await crearUsuario({ nombre, email });
      setUsuarios([...usuarios, nuevo]);
      setNombre('');
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h3>Agregar Nuevo Usuario</h3>
      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Guardar</button>
      </form>

      <h3>Lista de Usuarios</h3>
      {loading ? (
        <p>Cargando usuarios desde Spring Boot...</p>
      ) : (
        <ul>
          {usuarios.map((u) => (
            <li key={u.id}>
              <strong>{u.nombre}</strong> - {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}