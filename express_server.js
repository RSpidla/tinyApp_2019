const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['qwertyu', 'ertyui'],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(express.static("public"));
app.use('/images', express.static(__dirname + '/images'));

app.set("view engine", "ejs");

// URLs Database
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ47lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

// Users Database
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
  },
  "aJ48lW": {
     id: "aJ48lW", 
     email: "ray@ray.com", 
     password: "ray"
   }
}

// GET Routes
app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const usersURLS = urlsForUser(user_id, urlDatabase);
  const templateVars = { 
    urls: urlDatabase,
    users,
    user,
    usersURLS,
    error: ''
  };
  if (!user_id) {
    return res.redirect('/login');
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  const longURL = req.params['shortURL'];
  const templateVars = { 
    longURL,
    user
  };
  if (!user_id) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params['shortURL'];
  res.redirect(urlDatabase[req.params['shortURL']].longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };
  if (user_id === users[user_id]) {
    res.render('urls_show', templateVars);
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  const templateVars = {
    user,
    error: ''
  }
  res.render("register", templateVars);
});

// POST Routes
app.get('/login', (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  const templateVars = {
    user,
    error: ''
  }
  res.render("login", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const currentUserID = req.session['user_id'];
  const currentURL = urlDatabase[req.params.id];
  if (!currentUserID) {
    res.redirect('/login');
  }
  if (currentUserID !== currentURL.user_id) {
    const templateVars = {
      user: users[currentUserID],
      error: "Login to delete URLS"
    }
    res.render('urls_denied', templateVars);
  }
  else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

app.post('/urls/:id/edit', (req, res) => {
  const { longURL } = req.body;
  const currentUserID = req.session['user_id'];
  const currentURL = urlDatabase[req.params.id];
    
  if (!currentUserID) {
      return res.redirect('/login');
  }
  if (currentUserID !== currentURL.userID) {
      const templateVars = {
          user: users[currentUserID],
          error: "Login to edit URLS"
      }
      return res.render('urls_denied', templateVars);
  } else {
    urlDatabase[req.params.id] = {
      user_id: currentUserID, 
      longURL: longURL, 
      shortURL: currentUserID
    };
    res.redirect('/urls');  
  }
});

function checkUser(email, password) {
  for (let user_id in users) {
    let hashedPassword = users[user_id].hashedPassword;
      if (
        users[user_id].email === email &&    
        bcrypt.compareSync(password, hashedPassword)
      ) {
        return user_id;
        
      }
    }
}

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = checkUser(email, password);
  if (user_id) {
    req.session.user_id = user_id;
    res.status(200).redirect('/urls');
  } else {
      res.status(403);
      const user = users[user_id];
      const templateVars = {
        user,
        error: "Enter Email and Password"
      }
      res.render('login', templateVars)
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.status(200).redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const rng = generateRandomString();
  const user_id = rng;  
  let emailNotRegistered;
  for(let key in users) {
    if (users[key].email === email) {
      emailNotRegistered = false;
    } else {
      emailNotRegistered = true;
    }
  }
  if (!emailNotRegistered) {
    res.status(400);
    const user = users[user_id];
    const templateVars = {
      user,
      error: "Email Already Registered"
    }
    res.render('register', templateVars);
  } else if (!email || !password) {
    res.status(400);
    const user = users[user_id];
    const templateVars = {
      user,
      error: "Enter Email and Password"
    }
    res.render('register', templateVars);
  } else if (users[user_id]) {
    res.status(400);
    const user = users[user_id];
    const templateVars = {
      user,
      error: "400 Bad Request"
    }
    res.render('register', templateVars);
  } else {
    users[user_id] = { user_id, email, hashedPassword };
    req.session.user_id = user_id;
    res.status(200).redirect('urls');
  }
});

app.post("/urls", (req, res) => {
  const rng = generateRandomString();
  urlDatabase[rng] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.status(302).redirect(`/urls/${rng}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  var result = '';
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const urlsForUser = (id, data) => {
  let usersURLS = {};
  for (let key in data) {
    if (data[key].userID === id) {
      usersURLS[key] = data[key];
    }
  }
  return usersURLS;  
};