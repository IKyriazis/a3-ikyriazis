// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local").Strategy;
const flash = require('connect-flash');
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const uri = `mongodb+srv://user:abcdef123@cluster0.z38ps.mongodb.net/test?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology:true});
let ObjectID = require('mongodb').ObjectID;
let users = null;
let posts = null;
let comments = null;
let messages = null;
client.connect(err => {
  users = client.db("test").collection("users");
  posts = client.db("test").collection("posts");
  comments = client.db("test").collection("comments");
  messages = client.db("test").collection("messages");
  // perform actions on the collection object
});
let user = null;

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.json());
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));

// app.get("/getusername", (request, response) => {
//   if (user !== null) {
//     console.log("sending json");
//     response.json({username: user});
//   }
// })

app.post("/register", (request, response) => {
  users.findOne({username: request.body.username}).then(result => {
    if(result !== null) {
      response.json({message: "Username is taken"});

    }
    else {
      users.insertOne(request.body).then();
      response.json({message: "Account created successfully"});
    }
  })
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post("/login", bodyParser.json(), async function(
    request,
    response
) {
  let username = request.body.username;
  let password = request.body.password;

  let results = await users
      .find({ username: username})
      .toArray();
  let presentAccountID = null;

  if (results.length > 0) {
    if (results[0].password === password) {
      presentAccountID = results[0]._id.toString();

      request.session.accountSession = presentAccountID;
      request.session.auth = true;
      request.session.username = username;

      await response.json({message: "Logged in successfully"});
    }
    else {
      await response.json({message: "Wrong account information"});
    }
  } else {
    await response.json({message: "Wrong username"});
  }
});

// async function userExists(username) {
//   // checks to see if the username exists in the database
//   let result = await users.findOne({username: username});
//   return result !== null;
// };
//
// async function getPassword(username) {
//   let result = await users.findOne({username: username});
//   return result.password;
// };

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/loadData", async (request, response) => {
  let data = await posts.find({}).toArray();
  await response.json(data);
})

app.post("/addpost", (request, response) => {
  if (request.session.username === 'chrees') {
    posts.insertOne(request.body).then(function () {
      console.log("post added");
    })
  } else {
    console.log('U r not an admin');
  }

});

app.post("/loadcomments", (request, response) => {
  comments.find({title: request.body.title}).toArray().then(result => {
    response.json(result);
  })
})

app.post("/addcomment", (request, response) => {
  if (request.session.auth !== true) {
    response.json({successful: false});
  }
  else {
    comments.insertOne({username: request.session.username, title: request.body.title, text: request.body.text}).then(result => console.log("comment added"));
  }
})

app.get("/getmycomments", async (req, res) => {
  let userComments = await comments.find({username: req.session.username});

  userComments.toArray().then(result => {
    console.log(result);
    res.json(result);
  });
});

app.post("/editpost", async (request, response) => {
  let post = await posts.findOne({title: request.body.title});
  await response.json(post);
  // posts.findOne({title: request.body.title}).then(result => {
  //   console.log(result);
  //   response.json(result);
  // })
});

app.post("/deletepost", async (request, response) => {
  if (request.session.username === 'chrees') {
    await posts.deleteOne({title: request.body.title});
  }
  else {
    console.log('U r not an admin');
  }
});

app.post("/sendmessage", async (req, res) => {
  if (req.session.auth === true) {
    messages.insertOne({user: req.session.username, message: req.body.message, date: req.body.date, commMethod: req.body.commMethod, comm: req.body.comm, name: req.body.name}).then(() => {
      res.json({message: "Message sent successfully"});
    });

  }
  else {
    res.json({message: "You must be logged in to send a message"});
  }
});

app.get("/getmessages", async (req, res) => {
  if (req.session.username === "chrees") {
    let messagelist = await messages.find({}).toArray();
    res.json(messagelist);
  }
  else {
    res.json({message: "U r not an admin, sry :/"});
  }
});

app.post("/deletemessage", async (req, res) => {
  if (req.session.username !== "chrees") {
    await res.json({message: "u r not adminnnnn"});
  }
  else {
    const _id = new ObjectID(req.body._id);
    await messages.deleteOne({_id: _id});
    await res.json({message: "Message deleted"});
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
// listen for requests :)
const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
