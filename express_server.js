const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

function getUserByEmail(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

function createUser(email, password, users) {
  const userID = generateRandomString();
  const user = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  console.log("New user created:", user);
  users[userID] = user;
  return userID;
}

const urlsForUser = function(id) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const express = require("express");
const cookieParser = require("cookie-parser"); // Importing cookie-parser module
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const users = require('./users');
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Using cookie-parser middleware

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.userID];
  if (!user) {
    // if user is not logged in, return an error message
    res.status(401).send('You need to log in first!');
  } else {
    // if user is logged in, retrieve their URLs and render the urls_index page
    const userURLs = urlsForUser(user.id);
    const templateVars = { urls: userURLs, user };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userID; // Read the userID cookie
  if (userId) {
    const user = users[userId];
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies.userID];
  const templateVars = { id, longURL: urlDatabase[id].longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userId = req.cookies.userID; // Read the userID cookie
  if (userId) {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = { longURL: longURL, userID: userId };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("You must be logged in to shorten URLs.");
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("<h1>Short URL not found</h1>");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updatedLongURL = req.body.longURL; // Assuming the long URL is stored in the "longURL" property of the request body
  urlDatabase[id].longURL = updatedLongURL; // Update the longURL property of the corresponding object in the database
  res.redirect("/urls"); // Redirect the client back to the /urls page
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email or password.");
  } else {
    res.cookie("userID", user.id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const userId = req.cookies.userID; // Read the userID cookie
  if (userId) {
    // If the cookie exists, redirect the user to /urls
    res.redirect("/urls");
  } else {
    // If the cookie doesn't exist, render the login page
    res.render("login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.cookies.userID; // Read the userID cookie
  if (userId) {
    // If the cookie exists, redirect the user to /urls
    res.redirect("/urls");
  } else {
    // If the cookie doesn't exist, render the register page
    res.render("register");
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Email or password cannot be empty.");
  } else {
    const user = getUserByEmail(email, users);
    if (user) {
      res.status(400).send("Email already exists. Please try again.");
    } else {
      const newUserID = createUser(email, password, users);
      // not sure why this is throwing an error when trying to register
      // req.session.userID = newUser.id;
      // console.log(req.session);
      res.cookie("userID", newUserID);
      res.redirect("/urls");
    }
  }
});

