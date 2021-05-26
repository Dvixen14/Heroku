var port = process.env.PORT || 8000;
const MongoClient = require("mongodb").MongoClient;
const MongoStore = require('connect-mongo');
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
var session = require("express-session")({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  genid: () => uuidv4(),
  /*store:  MongoStore.create({
      client: MongoClient,
      dbName: 'mongochat'
    })*/
});
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

var sharedsession = require("express-socket.io-session");



const cors = require("cors");
const client = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

var url =
  "mongodb+srv://Davide:Y8jM2TdXWRs6aqZ@testcluster1.1p780.mongodb.net/mongochat";

client.use(sharedsession(session, {
  autoSave: true
}));

app.use(session)


app.use("/", express.static(__dirname + "/public"));

app.get('/login', (req, res) => {
  res.sendFile('/public/login.html', { root: __dirname });
  console.log(req.session.id);

})

app.get('/logout', (req, res) => {
  res.sendFile('/public/login.html', { root: __dirname });
  req.session.destroy();
})

app.get('/chat', (req, res) => {
  if (req.session.isLogged) {
    console.log(req.session.isLogged);
    res.sendFile('/public/chat.html', { root: __dirname });
  } else {
    console.log(req.session.isLogged);
    res.sendFile('/public/error.html', { root: __dirname });
  }
})

app.get('/index', (req, res) => {
  res.sendFile('/public/index.html', { root: __dirname });
})

app.get('/register', (req, res) => {
  res.sendFile('/public/register.html', { root: __dirname });
})


// Connessione a MongoDB
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var db = db.db("mongochat");

  /*var dbo = db.db("mongochat");
    dbo.createCollection("users", function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });*/

  console.log("Connesso a MongoDB...");

  // Connessione a Socket.io
  client.on("connection", function (socket) {
    let chat = db.collection("chats");
    let users = db.collection("users");

    // Chat dalla collection su MongoDB
    chat
      .find()
      .sort({ _id: 1 })
      .toArray(function (err, res) {
        //check for errors
        if (err) {
          throw err;
        }
        //else emit
        socket.emit("output", res);
      });

    // Gestione degli eventi input
    socket.on("input", function (data) {
      let date = data.date;
      let name = data.name;
      let message = data.message;

      // Controlla nome e messaggio
      if (message == "") {
        // Send error status

      } else {
        // Inserimento messaggio

        chat.insert({ name: name, message: message, date: date }, function () {
          client.emit("output", [data]);
        });
      }
    });

    // Handle clear
    socket.on("clear", function (data) {
      // Rimuove tutte la chat dalla collection
      chat.remove({}, function () {
        // Emit cleared
        socket.emit("cleared");
      });
    });

    socket.on("submit_register", function (data) {
      let user = data.username;
      let mail = data.email;
      let pwd = data.password;

      users.insertOne(
        { username: user, email: mail, password: pwd },
        function () {
          console.log("utente registrato...");
        }
      );
    });

    socket.on("check_users", function (data) {
      let username = data.username;
      let email = data.email;

      users
        .findOne({ $or: [{ username: username }, { email: email }] })
        .then(function (err, res) {
          //check for errors
          if (err) {
            throw err;
          }
          if (!res) {
            socket.emit("success", res);
          }
        })
        .catch((err) => socket.emit("fail"));
    });

    socket.on("submit_login", function (data) {
      let username = data.name;
      let password = data.password;

      //console.log(username);
      //console.log(password);

      users
        .find({
          $or: [
            { $and: [{ username: username }, { password: password }] },
            { $and: [{ email: username }, { password: password }] },
          ],
        })
        .toArray(function (err, res) {
          if (err) {
            throw err;
          }
          if (res.length > 0) {
            socket.handshake.session.isLogged = true
            socket.handshake.session.save()
            socket.emit("success", username);
          } else {
            socket.emit("fail");
          }
        });
    });
  });
});

server.listen(port, () => {
  console.log("listening on *:8000");
});
