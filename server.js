var port = process.env.PORT||8000;
const MongoClient = require("mongodb").MongoClient;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const client = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});

var url = "mongodb+srv://Davide:Y8jM2TdXWRs6aqZ@testcluster1.1p780.mongodb.net/mongochat";

app.use('/', express.static(__dirname + '/public'));


// Connessione a MongoDB
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
   var db = db.db('mongochat');

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
        
        sendStatus = function (s) {
            socket.emit("status", s);
        };

        // Chat dalla collection su MongoDB
        chat
            .find()
            .limit(100)
            .sort({ _id: -1 })
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
            if (name == "" || message == "") {
                // Send error status
                sendStatus("Please enter a name and message");
            } else {
                // Inserimento messaggio
                        
                chat.insert({name: name, message: message, date: date}, function () {
                    client.emit("output", [data]);

                    // Send status object
                    sendStatus({
                        message: "Message sent",
                        clear: true,
                    });
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

        socket.on('submit_register', function(data){
            let user = data.username;
            let mail = data.email;
            let pwd = data.password;

                users.insert({username: user, email: mail, password: pwd}, function(){
                    console.log("utente registrato...");
                });
        });

        socket.on('submit_login', function(data){
            let user = data.name;
            let pwd = data.password;

                users.insert({username: user, email: mail, password: pwd}, function(){
                    console.log("utente registrato...");
                });
        });


    });
});

server.listen(port, () => {
    console.log('listening on *:8000');
});