const sendButton = document.querySelector('#send');
const userInput = document.querySelector('#user-input');
const messagesList = document.querySelector('#messages-list');
const http = require('http').Server(app);
const express = require('express');
const io = require('socket.io')(http);
const mongo = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const cookie = require('cookie');

const port = 8080;
const url = 'mongodb://localhost:27017/chat';

const listElement = (url, signature, message) => {
    return `<li class="message-list-item">
            <div class="user-info">
              <div class="user-photo-wrapper">
                <img
                  src=${url}
                  id="use-photo"
                  width="80px"
                  height="80px"
                  object-position="-27px"
                />
              </div>
              <p class="user-signature">${signature}</p>
            </div>
            <div class="user-message">${message}</div>
          </li>`
}

 fetch('mongodb://localhost:27017/chat')
    .then(res => res.json())
    .then(res => {
        const chatList = res.map(el => {
            return listElement(el.userPhoto, el.userName, el.userMessage)
        })
        console.log('chatList', chatList);
        
        messagesList.insertAdjacentHTML('beforeend', chatList.join(' '));
    })
    .catch(err => console.error(err));

const newMessage = {
    userName: "Elrond",
    userPhoto: "https://comicvine.gamespot.com/a/uploads/original/11127/111273287/5824042-elrond_in_rivendell_-_the_hobbit.jpg",
    userMessage: ""    
}

const sendNewMessage = () => {
    newMessage.userMessage = userInput.value;

    fetch('mongodb://localhost:27017/chat', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage)
    })
    .then(res => res.json())
        .then(() => {
            userInput.value = ''
    })
    .catch(err => console.error(err));
}

sendButton.addEventListener('click', sendNewMessage)
 = require('express')();

function __getAllMessages(db, callback) {
  db.collection('messages').find().toArray(callback);
}

function getMessages(socket) {
  mongo.connect(url, (err, db) => {
    if (err) {
      socket.emit('error', err);
    }
    __getAllMessages(db, (err, result) => {
      if (err) {
        next(err);
      }
      socket.emit('messages', result);
      db.close();
    });
  });
}

function __saveMessage(db, message, callback) {
  db.collection('messages').insertOne({ message }, (err, result) => {
    if (err) {
      next(err);
    }
    callback();
  });
}

function saveMessages(socket, message) {
  mongo.connect(url, (err, db) => {
    __saveMessage(db, message, (result) => {
      db.close();
      socket.emit('message', message);
    });
  });
}

app.use(bodyParser.urlencoded({
  extended: true,
}));

function __saveUserData(db, username, password, callback) {
  db.collection('userData').insertOne({ username, password }, (err) => {
    if (err) {
      throw err; // write logics for the same name case (nick must be original
    }
    callback();
  });
}

function saveUserData(username, password, res) {
  mongo.connect(url, (err, db) => {
    let save = true;
    db.collection('userData').find().toArray((err, result) => {
      const len = result.length;
      for (let i = 0; i < len; i++) {
        if (result[i].username === username) {
          save = false;
        }
      }
      if (save === true) {
        __saveUserData(db, username, password, () => {
          db.close();
        });
        formPassed(res, username, 'Form is OK!');
      } else {
        formFailed(res, 'Error!');
      }
    });
  });
}


app.post('/', (req, res) => {
  const userName = req.body.user.username;
  const userPassword = req.body.user.password;
  saveUserData(userName, userPassword, res);
});

app.get('/login', (req, res) => {
  res.render('pageLogin.ejs', { title: 'login' });
});

app.post('/login', (req, res) => {
  const username = req.body.user.username;
  const password = req.body.user.password;
  auth(username, password, res);
});

function auth(username, password, res) {
  mongo.connect(url, (err, db) => {
    db.collection('userData').find().toArray((err, result) => {
      console.log('1');
      const len = result.length;
      let logged = false;
      for (let i = 0; i < len; i++) {
        console.log('2');
        if (result[i].username === username) {
          console.log('3');
          if (result[i].password === password) {
            logged = true;
          }
        }
      }
      if (logged) {
        formPassed(res, username, `Hello, ${username}!`);

      } else {
        authFailed(res);
      }
    });
    db.close();
  });
}

function formPassed(res, username, feedback) {
  res.setHeader('Set-Cookie', cookie.serialize('user', username, {
    httpOnly: false,// true, // tmp 
    maxAge: 60 * 60 * 24 * 7 // 1 week 
  }));
  res.render('index.ejs', { title: feedback });
}

function formFailed(res, feedback) {
  res.render('errNormalPage.ejs', { title: feedback });
}

function authFailed(res) {
  res.render('authFailed.ejs', { title: 'invalid data' });
}

app.get('/', (req, res) => {
  res.render('page.ejs', { title: 'authorizating!' });
});

io.on('connection', (socket) => {
  getMessages(socket);

  socket.on('chat message', (data) => {
    io.emit('chat message', data);
    saveMessages(socket, data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(port, () => {
  mongo.connect(url, (err, db) => {
    try {
      db.collection('messages').remove({});
    } catch (err) {}
    db.close();
  });
  console.log(`Listening on port ${port}....`);
});