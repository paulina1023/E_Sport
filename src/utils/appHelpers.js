export function formatearFecha(valor) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

export function tiempoHasta(valor) {
  const diferencia = new Date(valor).getTime() - Date.now();
  const minutos = Math.round(diferencia / 60000);
  if (minutos < 0) return "En curso o finalizado";
  if (minutos < 60) return `en ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `en ${horas} h`;
  const dias = Math.round(horas / 24);
  return `en ${dias} ${dias === 1 ? "día" : "días"}`;
}

export function puedeRegistrarResultado(partido) {
  if (partido.estado === "Finalizado") return true;
  return (
    new Date(partido.fecha_hora).getTime() + 90 * 60 * 1000 <= Date.now()
  );
}

export async function solicitarApi(ruta, token, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: {
      ...(opciones.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || "No fue posible completar la solicitud");
  }
  return datos;
}
