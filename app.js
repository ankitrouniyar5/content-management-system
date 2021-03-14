const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const config = require('./config/database')
const session = require('express-session')
const expressValidator = require('express-validator')

const port = process.env.PORT || 3000

//conneting to db
mongoose.connect(config.database,{useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection to db established")
});

//initialize app
const app = express()

//global error variable
app.locals.errors = null;

//setting up view engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

//seting up public folder 
app.use(express.static(path.join(__dirname,'public')))

//setting up body parser middle ware
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

//setting up express-session middle ware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
//   cookie: { secure: true }
}))

//setting up express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;
  
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
  })); 

//setting up express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



//setting up routes
const pages = require('./routes/pages.js')
const admin_pages = require('./routes/admin_pages.js')
const admin_categories = require('./routes/admin_categories.js')
app.use('/',pages)
app.use('/admin/pages',admin_pages)
app.use('/admin/categories',admin_categories)


app.listen(port,()=>{

    console.log('Server up and running on ' + port)

})






