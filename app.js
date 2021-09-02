const express = require('express')
const path = require('path')
const session = require('express-session')
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload')
const passport = require('passport')

const port = process.env.PORT 

//conneting to db
require('./mongoose')

//initialize app
const app = express()

//global error variable
app.locals.errors = null;

//get page model
const Page = require('./models/page')

Page.find({}).sort({sorting  :1}).exec((err,pages)=>{
    
    if(err) return console.log(err);
    
    app.locals.pages=pages;
    
    
})

//get category model
const Category = require('./models/category')

Category.find((err,categories)=>{
    if(err) return console.log(err);
    
    app.locals.categories = categories
})


//setting up view engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

//seting up public folder 
app.use(express.static(path.join(__dirname,'public')))

//setting up body parser middle ware
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true }));


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

//setting up express-fileupload middleware
app.use(fileUpload());

//passport config
require('./utilities/passport')(passport)

//passport middleware
app.use(passport.initialize())
app.use(passport.session())



app.get('*',(req,res,next)=>{
    res.locals.cart = req.session.cart
    res.locals.user = req.user || null
    next();
})

//setting up routes
const pages = require('./routes/pages.js')
const cart = require('./routes/cart.js')
const users = require('./routes/users.js')

const products = require('./routes/products.js')
const admin_pages = require('./routes/admin_pages.js')
const admin_categories = require('./routes/admin_categories.js')
const admin_products = require('./routes/admin_products')

app.use('/products',products)
app.use('/admin/pages',admin_pages)
app.use('/admin/categories',admin_categories)
app.use('/admin/products',admin_products)
app.use('/cart',cart)
app.use('/user',users)
app.use('/',pages)



app.listen(port,()=>{
    console.log('Server up and running on ' + port)

})






