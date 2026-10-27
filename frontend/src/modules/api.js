import { BASE_URL, TIEMPO_MAXIMO_MS } from "./config.js";
import { ErrorApi } from "./errores.js";
import { obtenerToken, olvidarSesion } from "./auth.js";

export const request = async (ruta, opciones = {}) => {
  const controller = new AbortController();

  const temporizador = setTimeout(() => {
    controller.abort();
  }, TIEMPO_MAXIMO_MS);

  const headers = new Headers(opciones.headers);

  headers.set("Accept", "application/json");

  const token = obtenerToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = opciones.body;

  if (
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${ruta}`, {
      ...opciones,
      headers,
      body,
      signal: controller.signal,
    });

    if (response.status === 204) {
      return null;
    }

    const datos = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        olvidarSesion();
        window.location.reload();
      }

      throw new ErrorApi(response.status, datos);
    }

    return datos;
  } finally {
    clearTimeout(temporizador);
  }
};