const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'levymarquezmendoza@gmail.com',
      pass: 'ieby ecic hxxh uzly'
    }});

const sendEmail = async (to, link) => {
        let mailOptions = {
          from: 'levymarquezmendoza@gmail.com',
          to: to,
          subject: 'Verificacion de correo',
          html: `
          <div style="text-align: center;">
          <a href='https://postimages.org/' target='_blank'><img src='https://i.postimg.cc/RF99cQ47/citdmi.jpg' border='0' alt='citdmi'/></a>
          <h1>Bienvenido a nuestra plataforma</h1>
               <p>Este es el link de verificacion haz click para verificar:</p>
               <a href="${link}" style="background-color: black; color: white; text-decoration: none; padding: 10px 20px; margin: 10px 0; display: inline-block;">Verificar correo electrónico</a>
               <p>Si tienes alguna pregunta, no dudes en contactarnos.</p></div>`
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email enviado: ' + info.response);
            }
          });
        };

const sendEmailPassword = async (email, code, subject) => {
    let mailOptions = {
        from: 'levymarquezmendoza@gmail.com',
        to: email,
        subject: subject,
        html: `<div style="text-align: center;">
        <a href='https://postimages.org/' target='_blank'><img src='https://i.postimg.cc/RF99cQ47/citdmi.jpg' border='0' alt='citdmi'/></a>
        <h1>Restablecimiento de contraseña</h1>
                   <p>Codigo de verificacion:</p>
                   <p style="color: blue; text-decoration: none; display: inline-block; font-size: 40px; font-weight: bold; margin: 0;">${code}</p>
                   <p>Si tienes alguna pregunta, no dudes en contactarnos.</p></div>`
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email enviado: ' + info.response);
                }
              });
            };


module.exports = {

  sendEmail,
  sendEmailPassword
}  