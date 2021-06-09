if (process.env.NODE_ENV !== "production")
{
    require('dotenv').config();
}

const express = require('express');
app = express();
const session = require('express-session');
const MongoDBStore = require("connect-mongo");
const mongoose = require('mongoose')
const path = require('path');
const methodOverride = require('method-override');
const Product = require('./models/Product')
const ejsMate = require('ejs-mate')
const catchAsync=require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Chat = require("./models/chat");
const { isLoggedIn, isAuthor, readAcknowledge } = require('./middleware/middleware');
// const { MongoStore } = require('connect-mongo');
const port = process.env.PORT || 3000;

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
httpServer.listen(port);







const userRoutes = require('./routes/users');
const yourDalaalRoutes=require('./routes/yourdalaal')
const profileRoutes = require('./routes/userProfile')
const inboxRoutes = require("./routes/inbox");

const dburl = process.env.DB_URL||'mongodb://localhost:27017/your-dalaal';
// const dburl ='mongodb://localhost:27017/your-dalaal';
// mongodb://localhost:27017/your-dalaal
mongoose.connect(dburl, {
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


console.log(__dirname);
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views')) 
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


const secret = process.env.SECRET||'thisissecret';

const store = MongoDBStore.create({
    mongoUrl: dburl,
    secret: secret,
    touchAfter: 24 * 60 * 60,
});
store.on("error", function (e) {
    console.log("session store error",e)
})


const sessionConfig = {
    store,
    name:'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
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

var connecteduser = {};


app.use((req, res, next) => {
    // console.log(req.user);
    res.locals.currentUser = req.user;
    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})
io.on('connection', (socket) => {
    //https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io
    socket.on('join', function (data) {
        let newUserId = data.id;
        socket.join(data.id);
        connecteduser[newUserId] = socket.id;
        // console.log(socket.id);
        // console.log(socket.rooms);
        // console.log(connecteduser);
        io.sockets.emit("online", { newUserId, connecteduser });
    })
    
    socket.on("disconnect", function () {
        function getKeyByValue(object, value) {
            return Object.keys(object).find((key) => object[key] === value);
        }
        let userid = getKeyByValue(connecteduser, socket.id);
        delete connecteduser[userid]
        // console.log("good bye", userid)
        // console.log(connecteduser);
        io.sockets.emit("offline", { connecteduser });
    })

    socket.on("readAcknowledge", readAcknowledge);
});

app.use((req, res, next) => {
    req.io = io;
    next();
})

app.get('/', (req, res) => {
    res.redirect('/yourdalaal');
})



app.use('/', userRoutes);
app.use('/yourdalaal/user', isLoggedIn, profileRoutes);
app.use('/yourdalaal/inbox', isLoggedIn, inboxRoutes);
app.use('/yourdalaal', yourDalaalRoutes);





app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    // if(!err.message) err.message='Oh No, Something Went Wrong! :('
    res.status(statusCode).render('error',{err})
})





//Feature Left
// -> option to upload product and profile image -done
// -> date of message -done
// -> time stamp in chatting  - done
// -> end to end encryption
// -> searching item/category
// -> sending attachment 
// -> read recipt
// -> online/offline status
// -> incoming message notification