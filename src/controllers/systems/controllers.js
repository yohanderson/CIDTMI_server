const { Pool } = require('pg');
const { Server } = require('ws');

const ipPorGlobal = 'http://192.168.1.111:3263';


const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '110799',
    database: 'dash',
    port: '5432'
});


// obtener token de dispositivos
const token = async (req, res) => {

  try {

    const token = req.body.token;
    // Verificar si el token ya existe en la base de datos
    const result = await pool.query('SELECT * FROM devices WHERE token = $1', [token]);

    if (result.rows.length > 0) {
      // El token ya existe en la base de datos
      res.status(200).json({ message: 'Token ya existe' });
    } else {
      // El token no existe en la base de datos, así que lo insertamos
      await pool.query('INSERT INTO devices (token) VALUES ($1)', [token]);
      res.status(201).json({ message: 'Token guardado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }

}


let wsClient;

// update app websokects
function updateDateApp (server) {
  const updateWs = new Server({ server });

  updateWs.on('connection', (ws) => {
    console.log('cliente connect')
    wsClient = ws;
  });

  updateWs.on('close', () => {
    console.log('Cliente desconectado');
  });
}


function getWsClient() {
  return wsClient;
}

module.exports = {
  //systems
  token,
  updateDateApp,
  getWsClient,
  pool,
  ipPorGlobal
}