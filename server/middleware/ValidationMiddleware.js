export function validarCamposRequeridos(...campos) {
	return (req, res, next) => {
		const faltantes = campos.filter(
			(campo) =>
				req.body[campo] === undefined ||
				req.body[campo] === null ||
				(typeof req.body[campo] === "string" && !req.body[campo].trim()),
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


export function validarLogin(req, res, next) {
	const errores = [];
	const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
	const password = typeof req.body.password === "string" ? req.body.password : "";
	if (!email) errores.push("El correo es obligatorio");
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errores.push("Introduce un correo electrónico válido");
	}
	if (!password) errores.push("La contraseña es obligatoria");
	if (password.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres");
	if (errores.length) return res.status(400).json({ error: errores[0], errores });
	req.body.email = email.toLowerCase();
	return next();
}

export function validarRegistro(req, res, next) {
	const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
	const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
	const password = typeof req.body.password === "string" ? req.body.password : "";
	const errores = [];
	if (!nombre) errores.push("El nombre es obligatorio");
	else if (nombre.length < 2 || nombre.length > 100) errores.push("El nombre debe tener entre 2 y 100 caracteres");
	if (!email) errores.push("El correo es obligatorio");
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push("Introduce un correo electrónico válido");
	if (password.length < 8 || password.length > 72) errores.push("La contraseña debe tener entre 8 y 72 caracteres");
	if (errores.length) return res.status(400).json({ error: errores[0], errores });
	req.body.nombre = nombre;
	req.body.email = email;
	return next();
}

export function manejarErrores(error, req, res, next) {
	if (res.headersSent) return next(error);
	const estado = error.name === "SequelizeValidationError" ? 400 : 500;
	return res.status(estado).json({
		error: error.message || "Error interno del servidor",
	});
}
