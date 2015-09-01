/**
 * Created by zhengyiwang on 8/29/15.
 */
function init() {
    var connected = false;
    var loginStatus = false;
    var myUserName;
    var sessionId;


    var socket = io();

    function loginNewUser(){
        myUserName = $('.username').val().trim();
        $('.login.page').fadeOut();
        $('.chat.page').show();
        $('.login.page').off('click');
        loginStatus = true;
        socket.emit('newuser', {id: sessionId, name: myUserName});

    }

    function sendMessage(){}

    function updateMessage(){}

    function reloadMessage(){}

    function leaveRoom(){}



   //socket on

    socket.on('connectaccepted', function () {
        sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);
        connected = true;

    });

    socket.on('newuseraccepted',function(){
        loginStatus = true;
        console.log('user' + myUserName + 'is successfully login');
        //call function load reloadmessage();
    });

    //input

    $('.login').on('click', loginNewUser());
    $('.postbutton').on('click', sendMessage);

}

$(document).on('ready', init);