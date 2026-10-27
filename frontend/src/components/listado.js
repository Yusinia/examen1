import { listarEquipos, eliminarEquipo } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const POR_PAGINA = 6;

const $lista = document.querySelector("#lista-equipos");
const $plantilla = document.querySelector("#tpl-equipo");
const $resumen = document.querySelector("#resumen");
const $paginaActual = document.querySelector("#pagina-actual");
const $btnAnterior = document.querySelector("#btn-anterior");
const $btnSiguiente = document.querySelector("#btn-siguiente");

let paginaActual = 1;
let ultimaPagina = 1;

// YA IMPLEMENTADO — "2026-09-15" -> "15 set 2026"
export const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });

export const cargarPagina = async (pagina = 1) => {
  $lista.setAttribute("aria-busy", "true");

  try {
    const respuesta = await listarEquipos(pagina, POR_PAGINA);

    const equipos = respuesta.data;
    const meta = respuesta.meta;

    paginaActual = meta.current_page;
    ultimaPagina = meta.last_page;

    $lista.replaceChildren();

    for (const equipo of equipos) {
      const copia = $plantilla.content.cloneNode(true);

      const tarjeta = copia.querySelector("li");
      tarjeta.dataset.id = equipo.id;

      copia.querySelector(".codigo").textContent = equipo.codigo;
      copia.querySelector(".nombre").textContent = equipo.nombre;

      copia.querySelector(".categoria").textContent =
        equipo.categoria?.nombre ?? "";

      copia.querySelector(".fecha").textContent =
        formatearFecha(equipo.fecha_adquisicion);

      const estado = copia.querySelector(".estado");

      estado.textContent = equipo.estado;
      estado.dataset.estado = equipo.estado;

      $lista.append(copia);
    }

    if (equipos.length === 0) {
      const elementoVacio = document.createElement("li");

      elementoVacio.className = "vacio";
      elementoVacio.textContent = "No hay equipos registrados.";

      $lista.append(elementoVacio);
    }

    const desde = meta.from ?? 0;
    const hasta = meta.to ?? 0;

    $resumen.textContent = `Mostrando ${desde}–${hasta} de ${meta.total}`;

    $paginaActual.textContent =
      `Página ${meta.current_page} de ${meta.last_page}`;

    $btnAnterior.disabled = paginaActual <= 1;
    $btnSiguiente.disabled = paginaActual >= ultimaPagina;
  } catch (error) {
    mostrarMensaje(
      "error",
      error.message || "No se pudo cargar el listado."
    );
  } finally {
    $lista.setAttribute("aria-busy", "false");
  }
};


const alHacerClicEnLista = async (evento) => {
  const boton = evento.target.closest(".btn-eliminar");

  if (!boton || !$lista.contains(boton)) {
    return;
  }

  const tarjeta = boton.closest("li[data-id]");

  if (!tarjeta) {
    return;
  }

  const confirmado = confirm("¿Desea eliminar este equipo?");

  if (!confirmado) {
    return;
  }

  boton.disabled = true;

  try {
    await eliminarEquipo(tarjeta.dataset.id);

    mostrarMensaje("exito", "Equipo eliminado.");

    const cantidadEnPagina =
      $lista.querySelectorAll("li[data-id]").length;

    if (cantidadEnPagina === 1 && paginaActual > 1) {
      await cargarPagina(paginaActual - 1);
    } else {
      await cargarPagina(paginaActual);
    }
  } catch (error) {
    if (error.status === 409) {
      mostrarMensaje("error", error.datos.mensaje);
    } else {
      mostrarMensaje("error", "No se pudo eliminar el equipo.");
    }
  } finally {
    boton.disabled = false;
  }
};

export const iniciarListado = () => {
  $lista.addEventListener("click", alHacerClicEnLista);

  $btnAnterior.addEventListener("click", () => {
    cargarPagina(paginaActual - 1);
  });

  $btnSiguiente.addEventListener("click", () => {
    cargarPagina(paginaActual + 1);
  });

  cargarPagina(1);
};