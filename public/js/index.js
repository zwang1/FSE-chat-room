/**
 * Created by zhengyiwang on 8/29/15.
 */
function init() {
    var loginStatus = false;
    var myUserName;
    var sessionId;
    var message;
    var $messageList = $('.messages');


    var socket = io();

    //function of login to chatroom
    function loginNewUser(){
        myUserName = $('.username').val().trim();
        if(myUserName)
            socket.emit('newuser', {id: sessionId, name: myUserName});

    }

    //function of sending message to server
    function sendMessage(){

        message = $('.inputMessage').val();


        if( loginStatus && message) {
             var sendTime = new Date();
            $('.inputMessage').val('');
            updateMessage({name: 'Me', message: message, time: sendTime});
            socket.emit('IHaveSomethingNew', {id: sessionId, name:myUserName, message:message, time: sendTime});
        }
    }


    //update the message list to add new coming messages
    function updateMessage(data){
        var timeInString = '';
        var start = 11;
        if(data.name=== "Me"){
            timeInString = data.time.toString();
            start = 16;
        }
        else
        timeInString = data.time;

        timeInString=timeInString.substr(start,5);



        var $usernameDiv = $('<div class="name col-sm-6" />')
            .text(data.name);

        var $sendTimeDiv = $('<div class="sendtime col-sm-6" />')
                .text(timeInString);

        var $messageDiv = $('<p class="message" />')
            .text(data.message);

        var $row = $('<div class= "row"/>').append($usernameDiv,$sendTimeDiv);

        var $newMessageSectionDiv = $('<li class="newMessageSection"/>')
            .append($row)
            .append($messageDiv);

        $messageList.append($newMessageSectionDiv);
    }

//TODO---------reload messages for re-entering user
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
        socket.emit('leaveRoom',{name: myUserName, id: sessionId});
    }


// TODO ----show instructions in red little font
    function tryAnotherUserName(){
        $('.failed').show();
        $('.username').val('');
    }



   //socket on

    //connected
    socket.on('connect', function () {
        sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);
    });




    //new user have the same name as someone currently in chatroom
    socket.on('newuserdenied', tryAnotherUserName);

    //new user login accepted
    socket.on('newuseraccepted', function(){
        $('.login.page').fadeOut();
        $('.chat.page').show();
        $('.login.page').off('click');
        $('.failed').off();
        loginStatus = true;
    });

    //if the user re-enter the chatroom, reload previous message
    socket.on('returninguser',function(data){
            reloadMessage();
    });

    socket.on('newmessagecoming',function(data){
        updateMessage(data );
    });

    //input

    $('.login.btn').on('click', loginNewUser);
    $('.postbutton').on('click', sendMessage);
    $('.leave').on('click',leaveRoom);

}

$(document).on('ready', init);