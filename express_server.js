function generateRandomString() {}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// adds a GET Route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// ask a mentor about what to put here!
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id]  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // Generate a new id for the short URL
  const id = generateRandomString();

  // Extract the longURL from the request body
  const longURL = req.body.longURL;

  // Add the id-longURL key-value pair to the urlDatabase
  urlDatabase[id] = longURL;

  // Redirect the user to the page that shows the short URL and its corresponding long URL
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
