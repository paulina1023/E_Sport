import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
	const encabezado = req.headers.authorization || "";
	const [tipo, token] = encabezado.split(" ");
	if (tipo !== "Bearer" || !token) {
		return res.status(401).json({ error: "Token requerido" });
	}
	try {
		req.usuario = jwt.verify(
			token,
			process.env.JWT_SECRET || "esports-dev-secret",
		);
		return next();
	} catch {
		return res.status(401).json({ error: "Token inválido o expirado" });
	}
}

export function autorizar(...roles) {
	return (req, res, next) => {
		if (!req.usuario || !roles.includes(req.usuario.rol)) {
			return res.status(403).json({ error: "No tienes permisos suficientes" });
		}
		return next();
	};
}
