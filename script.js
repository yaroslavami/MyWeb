var messages = document.getElementById('messages');
var sendButton = document.getElementById('send-btn');

sendButton.addEventListener('click', sendUserMessage);
function start() {
    setInterval()
}

async function getMessagesFromServer()
    
var response = await fetch('https://fchatiavi.herokuapp.com/get/arick/?offset=0&limit=1000000");

var response = await response.json();
var allMessagesHTML = '';
for (var i = 0; i < response.length; i++) {
var messageData = response[i];
// Создать верстку меседка
var message= <div class="message">
<div class="message-nickname"> (messageData.Name) </div>
<div class="message-text"> $(messageData.Message) </div>
</div>
allMessagesHTML = allMessagesHTML + message;