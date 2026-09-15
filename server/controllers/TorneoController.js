import * as torneoService from "../services/TorneoService.js";

async function responder(res, next, operacion, estado = 200) {
	try {
		return res.status(estado).json(await operacion());
	} catch (error) {
		return next(error);
	}
}

export function obtenerResumen(req, res, next) {
	return responder(res, next, () => torneoService.obtenerResumen());
}
export function obtenerTorneos(req, res, next) {
	return responder(res, next, () => torneoService.obtenerTorneos());
}
export function registrarTorneo(req, res, next) {
	return responder(res, next, () => torneoService.registrarTorneo(req.body), 201);
}
export function eliminarTorneo(req, res, next) {
	return responder(res, next, () =>
		torneoService.eliminarTorneo(req.params.id_torneo, req.body.motivo, req.usuario),
	);
}
export function finalizarTorneo(req, res, next) {
	return responder(res, next, () =>
		torneoService.finalizarTorneo(req.params.id_torneo),
	);
}
export function obtenerInscripciones(req, res, next) {
	return responder(res, next, () => torneoService.obtenerInscripciones());
}
export function obtenerPartidos(req, res, next) {
	return responder(res, next, () => torneoService.obtenerPartidos());
}
export function registrarPartido(req, res, next) {
	return responder(res, next, () => torneoService.registrarPartido(req.body), 201);
}
export function obtenerTablaPosiciones(req, res, next) {
	return responder(res, next, () =>
		torneoService.obtenerTablaPosiciones(req.params.id_torneo),
	);
}
export function registrarResultado(req, res, next) {
	return responder(res, next, () =>
		torneoService.registrarResultado(
			req.params.id_partido,
			req.body.goles_local,
			req.body.goles_visita,
		),
	);
}
