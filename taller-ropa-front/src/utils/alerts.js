import Swal from "sweetalert2";

export const confirmarEliminar = async (titulo, mensaje) => {
  const resultado = await Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
  });

  return resultado.isConfirmed;
};

export const alertaExito = (titulo) => {
  return Swal.fire({
    icon: "success",
    title: titulo,
    timer: 1800,
    showConfirmButton: false,
  });
};

export const alertaError = (titulo) => {
  return Swal.fire({
    icon: "error",
    title: titulo,
  });
};