import { request } from "./api.js";

// YA IMPLEMENTADO — ejemplo de uso de request()
// Respuesta: { data: [ { id, nombre }, ... ] }
export const listarCategorias = () => request("/categorias");

export const listarEquipos = (pagina = 1, porPagina = 6) => {
  return request(
    `/equipos?page=${encodeURIComponent(pagina)}&per_page=${encodeURIComponent(porPagina)}`
  );
};

export const crearEquipo = (datos) => {
  return request("/equipos", {
    method: "POST",
    body: datos,
  });
};

export const eliminarEquipo = (id) => {
  return request(`/equipos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};