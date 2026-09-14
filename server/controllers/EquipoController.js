import * as equipoService from "../services/EquipoService.js";

export async function obtenerEquipos(req, res, next) {
	try {
		return res.json(await equipoService.obtenerEquipos());
	} catch (error) {
		return next(error);
	}
}

export async function obtenerEquiposDelDelegado(req, res, next) {
	try {
		return res.json(
			await equipoService.obtenerEquiposDelDelegado(req.usuario.id_usuario),
		);
	} catch (error) {
		return next(error);
	}
}

export async function registrarEquipo(req, res, next) {
	try {
		return res.status(201).json(
			await equipoService.registrarEquipo(req.body, req.usuario.id_usuario),
		);
	} catch (error) {
		return next(error);
	}
}

export async function registrarJugador(req, res, next) {
	try {
		const resultado = await equipoService.registrarJugador(
			req.body,
			req.params.id_equipo,
			req.usuario.id_usuario,
		);
		if (!resultado) return res.status(404).json({ error: "Equipo no encontrado" });
		return res.status(201).json(resultado);
	} catch (error) {
		return next(error);
	}
}

export async function solicitarInscripcion(req, res, next) {
	try {
		const resultado = await equipoService.solicitarInscripcion(
			req.params.id_torneo,
			req.params.id_equipo,
			req.usuario.id_usuario,
		);
		if (!resultado) return res.status(404).json({ error: "Equipo no encontrado" });
		return res.status(201).json(resultado);
	} catch (error) {
		return next(error);
	}
}

export async function decidirInscripcion(req, res, next) {
	try {
		const resultado = await equipoService.decidirInscripcion(
			req.params.id_inscripcion,
			req.body.estado,
		);
		if (!resultado) return res.status(404).json({ error: "Inscripción no encontrada" });
		return res.json(resultado);
	} catch (error) {
		return next(error);
	}
}
