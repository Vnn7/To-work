const jwt = require('jsonwebtoken');
const { get } = require('../database');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não enviado.' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await get(
      `
        SELECT
          id,
          full_name AS fullName,
          email,
          account_type AS accountType,
          active,
          created_at AS createdAt
        FROM users
        WHERE id = ? AND active = 1
      `,
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
