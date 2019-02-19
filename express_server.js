const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");

const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static("public"));
app.use('/images', express.static(__dirname + '/images'));

app.set("view engine", "ejs");

// URLs Database ===============================
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
  },
  "aJ48lW": {
     id: "aJ48lW", 
     email: "ray@ray.com", 
     password: "ray"
   }
}


// GET Route Handlers ===============================

// Root URL Route ===============================
app.get("/", (req, res) => {
  res.send("Hello and Good Day!");
});

// New URL Route ===============================
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  let longURL = req.params['shortURL'];
  let templateVars = { 
    longURL,
    user
  };
  if (!user_id) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

// Short URL Requests Route ===============================
app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params['shortURL'];
  res.redirect(urlDatabase[req.params['shortURL']].longURL);
})

// Single and Shortened URL Route ===============================
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

// URLs Route ===============================
app.get("/urls", (req, res) => {
  
  console.log(req.cookies);
  
  
  let user_id = req.cookies['user_id'];
  console.log('TEST-user_id: ' + user_id);
  let user = users[user_id];
  console.log('user: ' + user);
  const usersURLS = urlsForUser(user_id, urlDatabase);
  console.log('usersURLS: ' + usersURLS);
  let templateVars = { 
    urls: urlDatabase,
    users,
    user,
    usersURLS
  };
  if (!user_id) {
    console.log('urls if statement');
    return res.redirect('/login');
  }
  console.log('urls render');
  res.render("urls_index", templateVars);
});

// URLs Route ===============================
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  let templateVars = {
    user    
  }
  res.render("register", templateVars);
});

// Login ===============================
app.get('/login', (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  let templateVars = {
    user
  }
  res.render("login", templateVars);
});


// POST Route Handlers ===============================

// Delete URL Route ===============================
app.post('/urls/:id/delete', (req, res) => {
  const currentUser_id = req.cookies['user_id'];
  const currentURL = urlDatabase[req.params.id];
  if (!currentUser_id) {
    res.redirect('/login');
  }
  if (currentUser_id !== currentURL.user_id) {
    let templateVars = {
      user: users[currentUser_id]
    }
    res.render('urls_denied', templateVars);
  }
  else {
    delete urlDatabase[req.params.id]
    res.redirect('/urls');
  }
});

// Update URL Route ===============================
app.post('/urls/:id/edit', (req, res) => {
  const { new_longURL } = req.body;
  const currentUser_id = req.cookies['user_id'];
  const currentURL = urlDatabase[req.params.id];
  if (!currentUser_id) {
      return res.redirect('/login');
  }
  if (currentUser_id !== currentURL.userID) {
      let templateVars = {
          user: users[currentUser_id]
      }
      return res.render('urls_denied', templateVars);
  } else {
    urlDatabase[req.params.id] = {
      user_id: currentUser_id, 
      longURL: new_longURL, 
      shortURL: currentUser_id
    };
    res.redirect('/urls');  
  }
});

// // Login Route ===============================
// app.post('/login', (req, res) => {
//   // const { email, password } = req.body;
//   const email = req.body.email;
//   const password = req.body.password;

  
  
//   // Step 1 - Email Comparison
//   let user;
//   for (let key in users) {
//     if (users[key].email === email) {
//       user = users[key];
//     }  
//   }
//    if(!user) {
//     res.status(400).send("<html><body><strong>Status: 400 Bad Request</strong> - User Doesn't Exist</body>");
//     return;
//    }
  
//   // Step 2 - Password Comparison
//   let userPass = users['shortURL'].password;
//   // conaole.log(users);
//   if (bcrypt.compareSync(password, userPass)) {
    
//     // Step 3 - If passwords match - Do login & redirect
//     req.cookies['user_id'] = user_id;
//     res.status(200).redirect('/');
//   } else {
    
//     // Step 4 - If passwords don't match - send failure
//     res.status(400).send("<html><body><strong>Status: 400 Bad Request</strong> - User Doesn't Exist</body>");
//   }

//   // Step 5 - End Password comparison



  


  
  
  
  



// });


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = users.user_id;
  let user_id;

  for (let key in users) {
      let userPassword = users[key].password;
      if (
        users[key].email === email &&
        
        bcrypt.compareSync(password, hashedPassword)
      ) {
        user_id = key;
      }
    }
  if (user_id) {
    console.log('if statement 1');
      // res.cookies['user_id'] = user_id;

      // res.cookies.user_id = user_id;

      res.cookie('user_id', user_id);

      res.status(200).redirect('/urls');
  } else {
    console.log('if statement 2');
      res.status(403).send('Status : 403 : Invalid username or password');
  }

  
});


// Logout Route ===============================
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', { path: '/' });
  res.status(200).redirect('/urls');
});

// Register Route ===============================
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
    res.status(400).send("<html><body><strong>Status: 400 Bad Request</strong> - Email Already Registered</body></html>");
  } else if (!email || !password) {
    res.status(400).send("<html><body><strong>Status: 400 Bad Request</strong> - Enter Email and Password</html></body>");
  } else if (users[user_id]) {
    res.status(400).send("<html><body><strong>Status: 400 Bad Request</strong>");
  } else {
    users[user_id] = { user_id, email, hashedPassword };

    console.log('user_id: ' + user_id);
    console.log('email: ' + email);
    console.log('hashedPassword: ' + hashedPassword);

    console.log(res.cookie);
    res.cookie('user_id', user_id);
    res.status(200).redirect('urls');
  }

});





// URLs Route ===============================
app.post("/urls", (req, res) => {
  let rng = generateRandomString();
  urlDatabase[rng] = req.body.longURL;
  res.status(302).redirect(`/urls/${rng}`);
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

// Return URLs of User Function ===============================
const urlsForUser = (id, data) => {
  let usersURLS = {};
  for (let key in data) {
    if (data[key].userID === id) {
      usersURLS[key] = data[key];
    }
  }
  return usersURLS;  
};


// App Starting Message Route ===============================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});