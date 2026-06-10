const jwt = require('jsonwebtoken');

function generateToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não foi configurado no .env');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      accountType: user.account_type
    },
    secret,
    {
      expiresIn: '7d'
    }
  );
}

module.exports = generateToken;
