/**
 * Created by zhengyiwang on 8/29/15.
 */
function init() {
    var connected = false;
    var loginStatus = false;
    var myUserName;
    var sessionId;
    var message;
    var $messageList = $('.messages');


    var socket = io();

    function loginNewUser(){
        myUserName = $('.username').val().trim();
    if(myUserName)
        socket.emit('newuser', {id: sessionId, name: myUserName});

    }

    function sendMessage(){

        message = $('.inputMessage').val();

 //TODO -----------changethe true  to loginStatus
        if( true && message) {
             var sendTime = new Date();
            $('.inputMessage').val('');
            updateMessage({username: 'Me', message: message, time: sendTime});
            socket.emit('IHaveSomethingNew', {id: sessionId, name:myUserName});
        }
    }

    function updateMessage(data){
        var $usernameDiv = $('<span class="username" />')
            .text(data.username);
        var $messageDiv = $('<span class="message" />')
            .text(data.message);
        var $sendTimeDiv = $('<span class="sendtime" />')
                .text(data.time);

        var $newMessageSectionDiv = $('<li class="newMessageSection"/>')
            .append($usernameDiv, $sendTimeDiv)
            .append($messageDiv);

        $messageList.append($newMessageSectionDiv);
    }


    function reloadMessage(){
        //get back latest 10 record from sqlite record
        //for each record call updateMessage
    }



    function leaveRoom(){
        $('.chat.page').fadeOut();
        $('.login.page').show();
        $('.chat.page').off('click');
        loginStatus = false;
        $('.username').val('');
    }







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

    socket.on('newuseraccepted', function(){
        $('.login.page').fadeOut();
        $('.chat.page').show();
        $('.login.page').off('click');
        loginStatus = true;
        reloadMessage();
    });

    socket.on('newmessagecoming',function(data){
        updateMessage();
    });

    //input

    $('.login').on('click', loginNewUser);
    $('.postbutton').on('click', sendMessage);
    $('.leave').on('click',leaveRoom);

}

$(document).on('ready', init);