const { sign } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const { randomBytes, verify } = require('crypto');
const bcrypt = require('bcrypt');
const compare = bcrypt.compare;
const hash = bcrypt.hash;
const schedule = require('node-schedule');
const {sendEmail, sendEmailPassword} = require("../systems/nodemailer_email");
const {ipPorGlobal, pool, getWsClient} = require("../systems/controllers");
const util = require('util');


//variables
const saltRounds = 13;

// inicio de sesion

const loginUserClient = async (req, res) => {

    const { email, password } = req.body;
  
    // Buscar el usuario en la base de datos por correo electrónico
    const query = 'SELECT user_id, name, user_name, sur_name, email, password, failed_attempts, verify_email FROM user_client WHERE email = $1';
    const userResponse = await pool.query(query, [email]);    
    const user = userResponse.rows[0];

  
    if (!user) {
      res.status(401).send('Usuario no encontrado');
      return;
    } else {

      //intentos fallidos
      const failedAttempts = userResponse.rows[0].failed_attempts

      if (failedAttempts >= 5) {
        return res.status(429).send('Has excedido el límite de intentos de inicio de sesión. Por favor, espera un momento e intenta de nuevo.');
        } else {

            const userId = userResponse.rows[0].user_id;

            // Convertir la contraseña almacenada (en formato bytea) a cadena
            const storePassword = user.password.toString('utf8');
        
            // Comparar la contraseña ingresada con la contraseña almacenada (desencriptada)
            const passwordMatch = await compare(password, storePassword);
        
              if (passwordMatch) {
                
                // Generar un clave secreta de sesión 
                const secretKey = randomBytes(32).toString('hex');
          
                // Generar un token JWT con la clave secreta única
                const token = sign({ userId: user.user_id }, secretKey, { expiresIn: '24h' });
          
                try {
                  const query = 'UPDATE user_client SET token = $1, failed_attempts = 0 WHERE user_id = $2';
                  await pool.query(query, [token, user.user_id]);
                } catch (error) {
                  console.error(error);
                }      
                  res.status(200).json({
                    token,
                    user_id: user.user_id,
                    name: user.name,
                    username: user.username,
                    surname: user.surname,
                    email: user.email,
                    verify_email: user.verify_email
                  });
  
              } else {
                // Contraseña incorrecta, denegar el acceso
                const query = 'UPDATE user_client SET failed_attempts = COALESCE(failed_attempts, 0) + 1 WHERE user_id = $1;';
                await pool.query(query, [userId]);
                res.status(401).send('Contraseña incorrecta');
              }
        };
    }
};

// inicio de sesion login con google

const loginUserClientTokenGoogle = async (req, res) => {
    const { email } = req.body; 
  
    try {

        // Buscar al usuario en la base de datos por correo electrónico
        const query = 'SELECT * FROM user_client WHERE email = $1';
        const userResponse = await pool.query(query, [email]);
        const user = userResponse.rows[0];
  
        if (!user) {
            res.status(401).send('Usuario no encontrado');
            return;
        }
  
        // Generar un token de sesión 
        const secretKey = randomBytes(32).toString('hex');

        // Generar un token JWT con la clave secreta única
        const token = sign({ userId: user.id }, secretKey, { expiresIn: '24h' });
  
        res.status(200).json({token}); // 200: OK

    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(500).send('Error interno del servidor'); // 500: Internal Server Error
    }
  };

// cambiar contraseña

const getEmailClient = async (req, res) => {
  const { email } = req.body;

  // Verificar si el usuario existe
  const query =  'SELECT user_id, name, sur_name FROM user_client WHERE email = $1';
  const responseEmail = await pool.query(query,
    [email]
  );

  if (responseEmail.rows.length > 0) {
    const userId = responseEmail.rows[0].user_id;
    const name = responseEmail.rows[0].name;
    const surname = responseEmail.rows[0].surname;

    res.status(200).send({ userId, name, surname });
  } else {
    res.status(401).send('Usuario no encontrado');
  }
};

const generatePasswordCodeClient = async (req, res) => {
    const { email, userId } = req.body;

    // Generar un enlace de restablecimiento de contraseña
    try {
      const longitud = 6;
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
        for (let i = 0; i < longitud; i++) {
          const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
          code += caracteres.charAt(indiceAleatorio);
        }

        const now = new Date();
        const query = 'UPDATE user_client set code = $1, create_at = $2  WHERE user_id = $3;';
      await pool.query(query, [code, now,userId]);
      
        sendEmailPassword(email, code, 'Restablecimiento de contraseña');
        res.status(200).send('Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico');
    } catch (error) {
        console.log('Error al generar el codigo de restablecimiento de contraseña:', error);
        res.status(400).send('No se pudo generar el enlace de restablecimiento de contraseña');
    }
};

const verifyResetCodeClient = async (req, res) => {
  const { userId, codeInto } = req.body;

  try {
    
    // Consulta la base de datos para obtener el código y la hora de creación
     const query = 'SELECT code, create_at FROM user_client WHERE user_id = $1;';
    const result = await pool.query(query, [userId]);

    const { code } = result.rows[0].code;

    const timeCreation = new Date(result.rows[0].create_at);
    
    const timeCurrent = new Date();

    console.log(timeCurrent, timeCreation);
      // Verifica si el tiempo está dentro del rango de 5 minutos
      
      if (timeCurrent - timeCreation <= 5 * 60 * 1000) {
          // Verifica si el código coincide
          if (code === codeInto) {
              res.status(200).send('Código válido. Puede restablecer la contraseña.');
          } else {
              res.status(400).send('Código no válido.');
          }
      } else {
          res.status(401).send('El código ha expirado.');
        }
      } catch (error) {
          console.error('Error al verificar el código:', error);
          res.status(500).send('Error interno del servidor.');
        }
};

const updatePasswordClient = async (req, res) => {
  const { userId, password, email } = req.body; 
  
  try {

    // Encriptar la contraseña
    const crytoPassword = await hash(password, saltRounds);

    // Realiza la actualización en la base de datos
    const query = 'UPDATE user_client SET password = $1 WHERE user_id = $2';
    await pool.query(query, [crytoPassword, userId]);

    res.status(200).json({ message: 'contraseña actualizado correctamente' });

    let mailOptions = {
      from: 'levymarquezmendoza@gmail.com',
      to: email,
      subject: 'Cambio de contraseña',
      html: `<div style="text-align: center;">
      <a href='https://postimages.org/' target='_blank'><img src='https://i.postimg.cc/RF99cQ47/citdmi.jpg' border='0' alt='citdmi'/></a>
      <h1>Restablecimiento de contraseña</h1>
                 <p>Se a cambiado la contraseña correctamente</p>
                 <p style="color: blue; text-decoration: none; display: inline-block; font-size: 25px; font-weight: bold; margin: 0;">Si no a sido tu por favor contactanos</p>
                 <p>Si tienes alguna pregunta, no dudes en contactarnos.</p></div>`
          };
          transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email enviado: ' + info.response);
              }
            });

  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// registro de usuario

const createdUserClient = async (req, res) => {
  const {user_name, name, sur_name, email, password } = req.body;

  // Verificar si el usuario ya está registrado
  const userExistsQuery = await pool.query('SELECT 1 FROM user_client WHERE email = $1 LIMIT 1', [email]);

  if (userExistsQuery.rowCount > 0) {
      res.status(401).send('Este usuario ya está registrado');
      return;
  } else {
      // Encriptar la contraseña
      const crytoPassword = await hash(password, saltRounds);

      // Insertar el usuario en la base de datos
      const query = 'INSERT INTO user_client ( email, password, user_name, name, sur_name, verify_email) VALUES ($1, $2, $3, $4, $5, false) RETURNING user_id';
      const response = await pool.query(query, [email, crytoPassword, user_name, name, sur_name]);
      console.log(response);

      // Obtener el ID del usuario recién creado
      const userId = response.rows[0].user_id;

      // Generar un clave secreta única
      const secretKey = randomBytes(64).toString('hex');

      //Genera un token jwt con clave secreta unica
      const token = sign({ userId: userId }, secretKey, { expiresIn: '24h' });

      // Actualizar el usuario con el token
      const updateQuery = 'UPDATE user_client SET token = $1, secret_key = $2 WHERE user_id = $3';
  await pool.query(updateQuery, [token, secretKey, userId]);

      // Generar un link de verificación
      const verificationLink = `${ipPorGlobal}/verify_email?token=${token}&email=${email}`;

      // Enviar el enlace de verificación al correo electrónico del usuario
      sendEmail(email, verificationLink);

      res.status(200).send(verificationLink);
  }
};


const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Buscar el usuario en la base de datos por correo electrónico
    const query = 'SELECT token, secret_key FROM user_client WHERE email = $1';
    const userResponse = await pool.query(query, [email]);    
    const reqToken = userResponse.rows[0].token;
    const secretKey = userResponse.rows[0].secret_key;

    let message = '';

    // Promisificar jwt.verify
    const verify = util.promisify(jwt.verify);

    try {
      await verify(token, secretKey);
      await pool.query('UPDATE user_client SET verify_email = true WHERE email = $1', [email]);
      message = 'éxito';
    } catch (err) {
      message = 'error'; 
    }

    // Redirigir a la página de verificación con el mensaje message
    res.redirect(`/verify?mensaje=${message}`);
  } catch(e) {
    console.log(e);
  }
};


// registro de usuario con google

const createdUserClientTokenGoogle = async (req, res) => {
    const { google_token, user_name, email } = req.body;

    // Verificar si el usuario ya está registrado
    const userExistsQuery = await pool.query('SELECT 1 FROM user_client WHERE email = $1 LIMIT 1', [email]);

if (userExistsQuery.rowCount > 0) {
    res.status(401).send('Este usuario ya está registrado');
    return;
} else {
  // Insertar el usuario en la base de datos
  try {
    const response = await pool.query('INSERT INTO user_client (google_token, user_name, email) VALUES ($1, $2, $3)', [google_token, user_name, email]);
    console.log(response);
    res.status(200).send('Usuario creado con Exito');
} catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).send('No autorizado');
}
}
};

const getAllAccountsUserClients = async (req, res) => {
    try {
        const query = 'SELECT user_name, email FROM user_client ORDER BY user_name ASC';
        const result = await pool.query(query);
        const accountClients = result.rows;

        // Enviar la respuesta JSON con las reservas
        res.status(200).json(accountClients);
    } catch (error) {
        console.error('Error fetching account client:', error);
        res.status(500).json({ error: 'Error fetching account clients' });
    }
};


// Programa una tarea para restablecer los intentos fallidos a las 00:00 horas todos los días

schedule.scheduleJob('0 0 * * *', async function(){
  try {
    await pool.query('UPDATE user_client SET failed_attempts = 0');
    console.log('Los intentos fallidos se han restablecido para todos los usuarios.');
  } catch (error) {
    console.error('Error al restablecer los intentos fallidos:', error);
  }
});


module.exports = {

    loginUserClient,
    loginUserClientTokenGoogle,
    createdUserClient,
    createdUserClientTokenGoogle,
    getAllAccountsUserClients,
    getEmailClient,
    generatePasswordCodeClient,
    verifyResetCodeClient,
    updatePasswordClient,
    verifyEmail
}