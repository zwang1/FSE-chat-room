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

db.serialize(function(){
    db.run('CREATE TABLE IF NOT EXISTS chatting (name TEXT, message TEXT, time DATE)');

});


// Socket.IO events
io.on('connection', function(socket){
    socket.on('newuser',function(data){
        console.log(JSON.stringify(data));
        if(currentusers.hasOwnProperty(data.name)){
            io.sockets.emit('newuserdenied');
        }
        // TODO ---------if name is in DB,get all messages and emit to client---ONLY this client
        else {
            db.run('SELECT name WHERE name = "' + data.name + '"',function(err, data){
                if(!err){
                    io.sockets.connected[data.id].emit('returninguser',{mess:'tes'});
                    //TODO--------
                }
            });
        }
        currentusers[data.name] = data.id;

        io.sockets.connected[data.id].emit('newuseraccepted');
        console.log('new user login' + data.name);
    })


    //TODO ---how if user disconnect by close the webpage
    socket.on('leaveRoom', function(data) {
        delete currentusers[socket.name];
        console.log('a user left'+ socket.name);
    });

    socket.on('IHaveSomethingNew',function(data){
        socket.broadcast.emit('newmessagecoming',data);
        db.run('INSERT INTO chatting (name, message, time) VALUES(?,?,?)', [data.name, data.message, data.time]);
    })


});


//Start the http server
httpserver.listen(app.get('port'), app.get('ipaddr'), function() {
    console.log('Server up and running. Go to http://' + app.get('ipaddr') + ':' + app.get('port'));
});