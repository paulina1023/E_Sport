import * as autenticacionService from "../services/AutenticacionService.js";

export async function registrar(req, res, next) {
	try {
		const resultado = await autenticacionService.registrar(req.body);
		if (resultado.conflicto) {
			return res.status(409).json({ error: "El correo ya está registrado" });
		}
		return res.status(201).json(resultado.usuario);
	} catch (error) {
		return next(error);
	}
}

export async function iniciarSesion(req, res, next) {
	try {
		const resultado = await autenticacionService.iniciarSesion(
			req.body.email,
			req.body.password,
		);
		if (!resultado) {
			return res.status(401).json({ error: "Credenciales inválidas" });
		}
		return res.json(resultado);
	} catch (error) {
		return next(error);
	}
}
