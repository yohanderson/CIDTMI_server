const { Pool } = require('pg');
const admin = require("firebase-admin");
const updateWs = require("../systems/controllers");

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '110799',
    database: 'dash',
    port: '5432'
});



// ------------------------//
// -------- Orders --------//
// ------------------------//

// crear order
const createdOrder = async (req, res) => {
  const { name, last_name, name_enterprise, country, region, address, address_two, population, postal_code, phone_number, notes, created_at, products, total, state, user_id } = req.body;


  try { 
    let orderId;

    const query = 'INSERT INTO order_table (name, last_name, name_enterprise, country, region, address, address_two, code_postal, phone_number, notes, created_at, products, total, state, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING order_id';
      const orderResponse = await pool.query(query, [name, last_name, name_enterprise, country, region, address, address_two, postal_code, phone_number, notes, created_at, products, total, state, user_id]);
      orderId = orderResponse.rows[0].order_id;

    // Obtener todos los tokens de la tabla devices
    const result = await pool.query('SELECT token FROM devices');
    const tokens = result.rows.map(row => row.token);

    // Enviar una notificación a todos los tokens (devices)
    var message = {
      data: {
        title: 'Nueva orden',
        type: 'new_order',
        orderId: orderId.toString(),
        name: name
      },
      tokens: tokens
    };
    

    admin.messaging().sendMulticast(message)
      .then((response) => {
        console.log(response.successCount + ' messages were sent successfully');
      });

    res.status(200).send('orden creada con éxito');

    if (updateWs.getWsClient()) {
      updateWs.getWsClient().send('updates orders');
      updateWs.getWsClient().send(`update orders client ${user_id}`);
    }
    
  } catch (error) {
    console.error('Error al crear usuario o orden:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};
  

  //obtener todas las order
const getAllOrders = async (req, res) => {
    try {
        const query = 'SELECT * FROM order_table ORDER BY created_at DESC';
        const result = await pool.query(query);
        const orders = result.rows;

        // Enviar la respuesta JSON con las citas
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

//obtener las ordenes del cliente
const getOrdersUser = async (req, res) => {
  const { user_id } = req.body;
  try {
    const query = 'SELECT * FROM order_table WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [user_id]);
    const reserves = result.rows;

    // Enviar la respuesta JSON con las reservas filtradas por usuario
    res.status(200).json(reserves);
  } catch (error) {
    console.error('Error fetching reserves:', error);
    res.status(500).json({ error: 'Error fetching reserves' });
  }
};


  //actualizar estado de la cita
const updateStateOrder = async (req, res) => {
    try {
      const { id, estado } = req.body; // Obtén los parámetros del cuerpo de la solicitud
  
      // Realiza la actualización en la base de datos
      await pool.query('UPDATE order_table SET state = $1 WHERE order_id = $2', [estado, id]);
  
      res.status(200).json({ message: 'Estado actualizado correctamente' });

      if (updateWs.getWsClient()) {
        updateWs.getWsClient().send('updates ordes');
      }

    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  //eliminar order
  const deleteOrder = async (req, res) => {
    try {
      const {id} = req.body;   

      // Realiza la eliminación en la base de datos
      await pool.query('DELETE FROM order_table WHERE order_id = $1', [id]);
  
      res.status(200).json({ message: 'Orden eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la orden:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  module.exports = {

    //orders
    createdOrder, 
    getAllOrders, 
    updateStateOrder, 
    deleteOrder,
    getOrdersUser

  }