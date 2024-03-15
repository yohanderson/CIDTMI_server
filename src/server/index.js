const express = require("express");
const cors = require("cors")
const admin = require("firebase-admin");
const http = require('http'); 
const updateDateWs = require('../controllers/systems/controllers')

//firebase_auth
const serviceAccount = require("../../configurations/firebase_admin/dash-cdb16-firebase-adminsdk-ql41j-21390048b3.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// servidor express
const app = express();

// sockets
const server = http.createServer(app);

// sockets para actualizar citas
updateDateWs.updateDateApp(server);




// middlewers
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//cors
const whilist = ['http://192.168.1.101:3263/dashboard']
app.use(cors());

// routes
app.use(require('../routes/routes'));


server.listen(3263);
console.log('server starting port 3263');





  