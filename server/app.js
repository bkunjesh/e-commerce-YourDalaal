const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const methodOverride = require('method-override');
const Product = require('./models/Product')
const ejsMate = require('ejs-mate')
const catchAsync=require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { isLoggedIn,isAuthor }=require('./middleware/middleware');



const userRoutes = require('./routes/users');
const yourDalaalRoutes=require('./routes/yourdalaal')
const profileRoutes=require('./routes/userProfile')



mongoose.connect('mongodb://localhost:27017/your-dalaal', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})



app = express();



console.log(__dirname);
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '\\..\\client\\views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


const sessionConfig = {
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize()); 
app.use(passport.session()); //this  should be come afte session

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    console.log(req.user);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/', userRoutes);

app.use('/yourdalaal/user', isLoggedIn, profileRoutes);

app.use('/yourdalaal', yourDalaalRoutes);





app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    // if(!err.message) err.message='Oh No, Something Went Wrong! :('
    res.status(statusCode).render('error',{err})
})



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Serving on port 3000')
})
