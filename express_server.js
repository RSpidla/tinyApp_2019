const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// Database ===============================
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GET Route Handlers ===============================

// Root URL Route ===============================
app.get("/", (req, res) => {
  res.send("Hello and Good Day!");
});

// New URL Route ===============================
app.get("/urls/new", (req, res) => {
  let longURL = req.params['shortURL'];
    let templateVars = { 
        longURL
    };
  res.render("urls_new", templateVars);
})

// Short URL Route ===============================
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  console.log(req.params.shortURL);
  res.render("urls_show", templateVars);
});

// URLs Route ===============================
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// URLs Route ===============================
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// POST Route Handlers ===============================

// URLs Route ===============================
app.post("/urls", (req, res) => {
  let rng = generateRandomString();
  urlDatabase[rng] = req.body.longURL;
  res.status(200).redirect(`/urls/${rng}`);
});

// URLs Route ===============================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Helper Functions ===============================

// Generate Random Number Function ===============================
function generateRandomString() {
  var result = '';
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};