const admin = require("firebase-admin");
const {getWsClient, pool} = require("../systems/controllers");


// crear Reservas 
const createdReserves = async (req, res) => {
    const {user_id, name, last_name, phone_number, equipment_type, date_time, created_at, falla_type, state } = req.body;

    try {   
         let reserveId;
  
        // Insertar reserva en la base de datos para el usuario
        const reserveResponse = await pool.query('INSERT INTO reserves (user_id, name, last_name, phone_number, equipment_type, date_time, created_at, falla_type, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING reserve_id', [user_id, name, last_name, phone_number, equipment_type, date_time, created_at, falla_type, state]);
        reserveId = reserveResponse.rows[0].reserve_id;
  
      // Obtener todos los tokens de la tabla devices
      const result = await pool.query('SELECT token FROM devices');
      const tokens = result.rows.map(row => row.token);
  
      // Enviar una notificación a todos los tokens (devices)
      var message = {
        data: {
          title: 'Nueva reserva',
          type: 'new_reserve',
          reserveId: reserveId.toString(),
          userId: user_id.toString(),
          name: name
        },
        tokens: tokens
      };
      
  
      admin.messaging().sendMulticast(message)
        .then((response) => {
          console.log(response.successCount + ' messages were sent successfully');
        });
  
      res.status(200).send('reserva creada con éxito');
  
      if (getWsClient()) {
        getWsClient().send('updates Reserves');
        getWsClient().send(`update reserves client ${user_id}`);
      }
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      res.status(500).send('Error al procesar la solicitud');
    }
  };
  
  //obtener las reservas del cliente
  const getReservesUser = async (req, res) => {
    const { user_id } = req.body;
    try {
      const query = 'SELECT * FROM reserves WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [user_id]);
      const reserves = result.rows;
  
      // Enviar la respuesta JSON con las reservas filtradas por usuario
      res.status(200).json(reserves);
    } catch (error) {
      console.error('Error fetching reserves:', error);
      res.status(500).json({ error: 'Error fetching reserves' });
    }
  };
  
  
  //obtener todas las reservas
  const getAllReserves = async (req, res) => {
      try {
          const query = 'SELECT * FROM reserves ORDER BY created_at DESC';
          const result = await pool.query(query);
          const reserves = result.rows;
  
          // Enviar la respuesta JSON con las reservas
          res.status(200).json(reserves);
      } catch (error) {
          console.error('Error fetching reserves:', error);
          res.status(500).json({ error: 'Error fetching reserves' });
      }
  };
  
  //actualizar estado de la reserva
  const updateStateReserves = async (req, res) => {
      try {
        const { reserve_id, state } = req.body; // Obtén los parámetros del cuerpo de la solicitud
    
        // Realiza la actualización en la base de datos
        await pool.query('UPDATE reserves SET state = $1 WHERE reserve_id = $2', [state, reserve_id]);
    
        res.status(200).json({ message: 'Estado actualizado correctamente' });
  
        if (getWsClient()) {
          getWsClient().send('updates Reserves');
        }
  
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    };
  
  //eliminar reserva
    const deleteReserve = async (req, res) => {
      try {
        const {id} = req.body;   
  
        // Realiza la eliminación en la base de datos
        await pool.query('DELETE FROM reserves WHERE reserve_id = $1', [id]);
    
        res.status(200).json({ message: 'Reserva eliminada correctamente' });
      } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    };


const schedule = require('node-schedule');

// Programa una tarea para actualizar el estado de las reservas a las 00:00 horas todos los días
schedule.scheduleJob('0 0 * * *', async function(){ 
  try {
    await pool.query("UPDATE reserves SET state = 'Expiró' WHERE date_time < NOW()");
    console.log('El estado de las reservas ha sido actualizado.');
  } catch (error) {
    console.error('Error al actualizar el estado de las reservas:', error);
  }
});



module.exports = {

    //reserves
    createdReserves,
    getAllReserves,
    updateStateReserves,
    deleteReserve,
    getReservesUser,
    

}