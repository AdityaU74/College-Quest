if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const joi = require('joi')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const session = require('express-session')
const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users');
const collegesRoutes = require('./routes/colleges.js');
const reviewsRoutes = require('./routes/reviews.js');
const mongoSanitize = require('express-mongo-sanitize');



const app = express();

const dbUrl = process.env.DB_URL;

main().catch(err => console.log(err));

async function main() {
  try{
    await mongoose.connect(dbUrl);
    console.log('database connected!');

  }
  catch(err){
    console.log(err);
  }
  
}

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'thisshouldbeasecret'
  }
});

const sessionConfig = {
  store,
  name: 'session',
  secret: 'thisshouldbesecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use('/', userRoutes);
app.use('/colleges',collegesRoutes);
app.use('/colleges/:id/reviews',reviewsRoutes);

app.get('/', (req, res) => {
  res.render('home')
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})