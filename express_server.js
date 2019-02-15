const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// URLs Database ===============================
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users Database ===============================
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


// GET Route Handlers ===============================

// Root URL Route ===============================
app.get("/", (req, res) => {
  res.send("Hello and Good Day!");
});

// New URL Route ===============================
app.get("/urls/new", (req, res) => {
  let longURL = req.params['shortURL'];
    let templateVars = { 
      username: req.cookies["username"],  
      longURL
    };
  res.render("urls_new", templateVars);
})

// Short URL Requests Route ===============================
app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params['shortURL'];
  res.status(302).redirect(urlDatabase[longURL]);
})

// Single and Shortened URL Route ===============================
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// URLs Route ===============================
app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// URLs Route ===============================
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


app.get('/register', (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("register", templateVars);
});



// app.get('/register', (req, res) => {
//   const currentUser_id = req.session.user_id;
//   if (users[currentUser_id]) {
//       return res.redirect('/urls');
//   }
//   res.render("register");
// });



// Login ===============================
app.get('/login', (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("login", templateVars);
});


// POST Route Handlers ===============================

// Delete URL Route ===============================
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

// Update URL Route ===============================
app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedLongURL;
  res.redirect('/urls');
})

// Login Route ===============================
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

// Logout Route ===============================
app.post('/logout', (req, res) => {
  res.clearCookie('username', { path: '/' });
  res.status(200).redirect('/urls');
});

// Register Route ===============================
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const rng = generateRandomString();
  const user_id = rng;
  const user = { user_id, email, password };
  // console.log(user);
  // console.log('user_id: ' + user_id);
  // console.log('email: ' + email);
  // console.log('password: ' + password);
  res.cookie('user_id', user_id);

  if (user.email === "" || user.password === "") {
    res.status(400).send("Status: 400 Bad Request - Enter Email and Password");
  }

  let isFound = false;
  for (let key in users) {
    if (users[key].email === email) {
      isFound = true;
    }
  } 
  if (isFound === true) {
    res.status(400).send("Status: 400 Bad Request - Email Already Registered");
  }
  else {
    users[user_id] = user;
    req.session['user_id'] = user_id;
    req.status(200).redirect('urls');
    // req.status(201).redirect('urls');
  };

});





// URLs Route ===============================
app.post("/urls", (req, res) => {
  let rng = generateRandomString();
  urlDatabase[rng] = req.body.longURL;
  res.status(302).redirect(`/urls/${rng}`);
});

// App Start Message Route ===============================
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