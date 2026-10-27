import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

export const iniciarFormulario = ({ alGuardar }) => {
  listarCategorias()
    .then((respuesta) => {
      for (const categoria of respuesta.data) {
        const opcion = document.createElement("option");

        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;

        $selectCategoria.append(opcion);
      }
    })
    .catch(() => {
      mostrarMensaje("error", "No se pudieron cargar las categorías.");
    });

  $form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    $form.querySelectorAll("[data-error]").forEach((elemento) => {
      elemento.textContent = "";
    });

    $form.querySelectorAll("[aria-invalid]").forEach((elemento) => {
      elemento.removeAttribute("aria-invalid");
    });

    const datos = Object.fromEntries(new FormData($form));

    if (datos.categoria_id !== "") {
      datos.categoria_id = Number(datos.categoria_id);
    }

    if (datos.costo_interno !== "") {
      datos.costo_interno = Number(datos.costo_interno);
    }

    const textoOriginal = $btnGuardar.textContent;

    $btnGuardar.disabled = true;
    $btnGuardar.textContent = "Guardando…";

    try {
      await crearEquipo(datos);

      $form.reset();

      mostrarMensaje(
        "exito",
        `Equipo ${datos.codigo} registrado.`
      );

      alGuardar();
    } catch (error) {
      if (error.status === 422) {
        const errores = error.datos.errors ?? {};

        for (const [campo, mensajes] of Object.entries(errores)) {
          const aviso = $form.querySelector(
            `[data-error="${campo}"]`
          );

          const input = $form.elements.namedItem(campo);

          if (aviso) {
            aviso.textContent = mensajes[0];
          }

          if (input) {
            input.setAttribute("aria-invalid", "true");
          }
        }
      } else {
        mostrarMensaje("error", "No se pudo registrar el equipo.");
      }
    } finally {
      $btnGuardar.disabled = false;
      $btnGuardar.textContent = textoOriginal;
    }
  });
};