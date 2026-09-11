export function validarCamposRequeridos(...campos) {
	return (req, res, next) => {
		const faltantes = campos.filter(
			(campo) =>
				req.body[campo] === undefined ||
				req.body[campo] === null ||
				req.body[campo] === "",
		);
		if (faltantes.length > 0) {
			return res.status(400).json({
				error: "Faltan campos requeridos",
				campos: faltantes,
			});
		}
		return next();
	};
}

export function manejarErrores(error, req, res, next) {
	if (res.headersSent) return next(error);
	const estado = error.name === "SequelizeValidationError" ? 400 : 500;
	return res.status(estado).json({
		error: error.message || "Error interno del servidor",
	});
}
