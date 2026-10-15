import { API_BASE } from '../Config';

/**
 * Elimina un registro llamando a DELETE /api/{recurso}/{id}.
 * Devuelve { ok: true } si se borró, o { ok: false, mensaje } si falló.
 *
 * recurso: 'productos' | 'camaras' | 'clientes' | 'operadores'
 */
export const eliminarRegistro = async (recurso, id) => {
  const token = localStorage.getItem('userToken');

  try {
    const res = await fetch(`${API_BASE}/${recurso}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) return { ok: true };

    // El backend responde { "mensaje": "..." } en 409 (tiene dependencias) y 404 (no existe)
    const data = await res.json().catch(() => ({}));

    const mensajePorDefecto =
      res.status === 409
        ? 'No se puede eliminar el registro porque está asociado a movimientos, lotes o stock existentes.'
        : res.status === 404
        ? 'El registro ya no existe.'
        : 'No se pudo eliminar el registro.';

    return { ok: false, mensaje: data.mensaje || mensajePorDefecto };
  } catch (error) {
    return { ok: false, mensaje: 'Error de conexión con el servidor.' };
  }
};
