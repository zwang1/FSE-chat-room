/**
 * Created by zhengyiwang on 8/29/15.
 */
/*
 will use the following development stack:
 Framework:
    Express
 Middleware:
    Body parser
 Libs:
    HTTP, Underscore, SocketIO
 Database:
    SQLite
 */
var express = require('express'),
    app = express(),
    httpserver = require('http').createServer(app),
    io = require('socket.io')(httpserver),
    bodyParser = require('body-parser'),
    _ = require('underscore');


// Server config
app.set('ipaddr', '127.0.0.1');
app.set('port', 8080);

//Jade
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//Static files
app.use(express.static('public'));

//Support JSON requests
app.use(bodyParser.json());

//route handler
app.get('/', function(request, response) {
    response.render('index');
});

//connected users list
var currentusers = {};
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');



// Socket.IO events
io.on('connection', function(socket){
    socket.on('newuser',function(data){
        if(currentusers.has(data.name)){
            io.sockets.emit('newuserdenied');
        }
        // TODO ---------if name is in DB,get all messages and emit to client---ONLY this client
        else if(){

        }
        currentusers[data.name] = data.id;

        io.sockets.socket(data.id).emit('newuseraccepted');
        console.log('new user login' + data.name);
    })


    //TODO ---how if user disconnect by close the webpage
    socket.on('leaveRoom', function(data) {
        delete currentusers[socket.name];
        console.log('a user left'+ socket.name);
    });

    socket.on('IHaveSomethingNew',function(data){
        socket.emit.broadcast('newmessagecoming',data);
        //TODO---insert into DB
    })


});


//Start the http server
httpserver.listen(app.get('port'), app.get('ipaddr'), function() {
    console.log('Server up and running. Go to http://' + app.get('ipaddr') + ':' + app.get('port'));
});