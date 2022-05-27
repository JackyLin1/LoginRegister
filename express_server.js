const express = require("express");
let cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const {generateRandomString, emailChecker, cookieHasUser} = require('./helpers');

//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['Hi'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//collector variable for users
const users = {};

//logs which port is listening upon connection.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//if logged in go to home page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//renders url_index.ejs to /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//login page
app.get('/login', (req,res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

//set a cookie for user when logged in.
app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!emailChecker(email, users)) {
    res.status(403).send("This email does not exist, please register!");
  } else {
    const newID = emailChecker(email, users);
    if (!bcrypt.compareSync(password, users[newID].password)) {
      res.status(403).send("Wrong password, please try again");
    } else {
      req.session.user_id = newID;
      res.redirect("/urls");
    }
  }
});

//clear cookie upon clicking logout
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

//website for registering
app.get("/register", (req,res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }
});

//creating an account, check if email exist, check if missing email or password
app.post('/register', (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please enter a valid email and password");
  } else if (emailChecker(email, users)) {
    res.status(400).send("OOPS! This email is not avaliable");
  } else {
    let id = generateRandomString();
    users[id] = {
      id,
      email,
      password : bcrypt.hashSync(password, 10),
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});