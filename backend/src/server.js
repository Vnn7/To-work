require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./database');

const port = Number(process.env.PORT || 3001);

async function startServer() {
  try {
    await initDatabase();

    app.listen(port, () => {
      console.log(`API To Work rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a API:', error);
    process.exit(1);
  }
}

startServer();
