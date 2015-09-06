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
    bodyParser = require('body-parser');


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
    db.run('CREATE TABLE IF NOT EXISTS chatting (name TEXT, message TEXT, time TEXT)');

});

function checkNameAndSendMessages(name){
    db.get('SELECT name FROM chatting WHERE name = ?', name, function(err,row){
        if (row) {
            console.log('user exists in data and retrieve all messages from the database.');

            db.all('SELECT name, message,time FROM chatting limit 10', function (err, row) {

                console.log(JSON.stringify(row));
                io.sockets.connected[currentusers[name]].emit('returninguser', {mess: JSON.stringify(row)});

            });
        }
    });
}


// Socket.IO events
io.on('connection', function(socket){
    console.log('socket connected');

    //when a new user login request comes
    socket.on('newuser',function(data){

        //if same name has login in current user list, deny
        if(currentusers.hasOwnProperty(data.name)){
            io.sockets.emit('newuserdenied');
            console.log('one user denied');
        }
        else {
            currentusers[data.name] = data.id;
            io.sockets.connected[data.id].emit('newuseraccepted');
            checkNameAndSendMessages(data.name);
        }
    });


//when user left or disconnect
    socket.on('leaveRoom', function(data) {
        delete currentusers[data.name];
        console.log('a user left  '+ data.name);
    });

    socket.on('disconnect', function() {
        for (var k in currentusers){
            if (currentusers[k] === this.id){
                delete currentusers[k];
                console.log('a user left   '+ k);
                break;
            }
        }

    });

    socket.on('IHaveSomethingNew',function(data){
        socket.broadcast.emit('newmessagecoming',data);

        console.log('recieve time' + data.time);
        db.run('INSERT INTO chatting (name, message, time) VALUES(?,?,?)', [data.name, data.message, data.time]);
        console.log('send time' + data.time);

    })


});


//Start the http server
httpserver.listen(app.get('port'), app.get('ipaddr'), function() {
    console.log('Server up and running. Go to http://' + app.get('ipaddr') + ':' + app.get('port'));
});