const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const fetchUsuarios = async () => {
  const response = await fetch(`${API_URL}/usuarios`);
  if (!response.ok) throw new Error('Error al obtener los usuarios');
  return response.json();
};

export const crearUsuario = async (usuarioData) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application.json',
    },
    body: JSON.stringify(usuarioData),
  });
  if (!response.ok) throw new Error('Error al registrar el usuario');
  return response.json();
};