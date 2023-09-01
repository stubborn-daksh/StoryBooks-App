const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path');

//Initialize express 
const app = express();
//---------------------------------------------------------------------------------------------
//Body - Parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())
//-------------------------------------------------------------------------------------------------

//Method Override
app.use(methodOverride(function (req,res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method 
        return method
    }
}))

//--------------------------------------------------------------------------------------------------
//passport config
require('./config/passport')(passport)
//------------------------------------------------------------------------------------------------

// loat dotenv with config()
dotenv.config({path: './config/config.env'})
//-------------------------------------------------------------------------------------------------

//Database connection
const connectDB = require('./config/db');
connectDB();
//--------------------------------------------------------------------------------------------------

//Morgan Logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//------------------------------------------------------------------------------------------------

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//-----------------------------------------------------------------------------------------------

//Express-handlebars , Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')
app.engine('.hbs', exphbs.engine({  helpers: { formatDate, stripTags, truncate, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

//-------------------------------------------------------------------------------------------------

//session

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection : mongoose.connection})
}))

//------------------------------------------------------------------------------------------------

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//------------------------------------------------------------------------------------------------

// Set Global var
app.use(function (req,res, next) {
     res.locals.user = req.user || null
     next()
} )


//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

//----------------------------------------------------------------------------------------------

//listen a server on specified port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})