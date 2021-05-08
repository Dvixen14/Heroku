var port = process.env.PORT||3000;
const express = require('express');
let ejs = require('ejs');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.set('view-engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('index.ejs', { name: "Davide"})
})

server.listen(port, () => {
    console.log('listening on *:3000');
});