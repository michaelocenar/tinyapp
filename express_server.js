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

function createUser(email, password) {
  const userID = generateRandomString();
  const user = {
    id: userID,
    email: email,
    password: password
  };
  console.log("New user created:", user);
  users[userID] = user;
  return userID;
}



const express = require("express");
const cookieParser = require("cookie-parser"); // Importing cookie-parser module
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const users = require('./users');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Using cookie-parser middleware

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req,res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies.user_id];
  const templateVars = { id, longURL: urlDatabase[id], user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
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
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  res.render("login"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
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
      const newUser = createUser(email, password, users);
      req.session.user_id = newUser.id;
      res.redirect("/urls");
    }
  }
});

