const express = require("express")
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')


//Page Model

const User = require('../models/user');

//get register
router.get('/register',async(req,res)=>{

    try {
        res.status(200).render('register',{
        title : 'Register'
    })
    } catch (error) {
        console.log(error)
        res.status(500).send('Some error')
    }
})



router.post('/register',async(req,res)=>{

    try {
        
        let name = req.body.name
        let username = req.body.username
        let email = req.body.email
        let password = req.body.password
        let confirmPassword = req.body.confirmPassword 

       req.checkBody('name','Name is required').notEmpty();
       req.checkBody('username','User Name is required').notEmpty();

       req.checkBody('email','Email is required').isEmail();
       req.checkBody('password','Password is required').notEmpty();
       req.checkBody('confirmPassword','Password do not match').equals(password);

       const errors = req.validationErrors();

       if(errors){
           res.render('register',{
               errors,
               title : 'Register'
           })
       }else{

        user = await User.findOne({username})
        if(user){
            req.flash('danger','User already exists');
            res.redirect('/users/register')
        }else{
            user = new User ({
                name,
                email,
                username,
                password,
                admin : 0

            })

            const hashedPassword = await bcrypt.hash(password, 8)
            user.password = hashedPassword

            await user.save()
            req.flash('success',`Welcome ${name} . You have successfull registered`);
            res.redirect('/user/login')

            

        }

       }
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Some error')
    }
})

//get login
router.get('/login',async(req,res)=>{

    try {
        if(res.locals.user) res.redirect('/')
        
        res.render('login',{
            title:'Login'
        })
  
    } catch (error) {
        console.log(error)
        res.status(500).send('Some error')
    }
})

//post login
router.post('/login',async(req,res,next)=>{

    try {
       passport.authenticate('local',{
           successRedirect : '/',
           failureRedirect : '/user/login',
           failureFlash : true
       })(req,res,next)
    } catch (error) {
        console.log(error)
        res.status(500).send('Some error')
    }
})
module.exports = router