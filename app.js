// If we are in development mode, require the dotenv package
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// Use ejs-mate as engine instead of ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tell express to parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));  // Serve static directory
app.use(mongoSanitize());   // Prevents NoSQL injections, eg., query '$' in get request

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// Use Mongo for session store
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60    // 24 hours in seconds
})

store.on('error', function (e) {
    console.log('Session Store Error!');
})

const sessionConfig = {
    store,
    name: 'session',   // Defined instead of default: connect.sid
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,   // Cookie can only be changed/configured over https
        // Note localhost is http so setting this to true will not allow us to login
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // A week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({    // Adds additional response headers for GET requests
    // contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",     // Bootstrap styles don't work unless this is here...
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com"
];
// Only allow certain scripts, stylesheets etc to be used
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duoz8rdh3/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        },
    })
);

// Initialize passport. Session must be used for persisent login
app.use(passport.initialize());
app.use(passport.session());
// Static method authenticate() was added to User model.
// authenticate() does all the hashing/salts stuff
passport.use(new LocalStrategy(User.authenticate()));

// Tell passport how to serialize user -> how to store user into a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   // How to unstore user from session

// Set up flash middleware before route handler so that we'll have access to
// locals in our template, no need to pass through in eg., redirect pages
app.use((req, res, next) => {
    res.locals.currentUser = req.user;  // For showing/hiding Login/Register/Logout buttons
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'naooo@gmail.com', username: 'naooo' });
//     // Registers new user with password taken care of
//     const newUser = await User.register(user, 'naooo');
//     res.send(newUser);
// })

// Use routes with specified prefixes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
// Note: By default, we don't have access to the 'id' param in reviews route
// Routes get separate params, unless 'mergeParams' is set to true

app.get('/', (req, res) => {
    res.render('home');
});


// For every single request -> "*" is for every path
// This will run if nothing else is matched first
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Generic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong! :(';
    res.status(statusCode).render('error', { err });
})

// Default port is automatically in this env var, 80 for Heroku
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})