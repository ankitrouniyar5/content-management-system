const localStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports = (passport)=>{

    passport.use(new localStrategy(async(username,password,done)=>{
        try {
            user = await User.findOne({username})

            if(!user){
                return done(null,false, {message : 'No user found'})
            }

            isMatch = await bcrypt.compare(password,user.password)
            if(isMatch){
                return done(null,user)
            }else{
                return done(null,false, {message : 'Password is incorrect'})
            }
        } catch (error) {
            console.log(error)
        }
       
    }))

    passport.serializeUser((user, done)=>{
        done(null,user.id)
    })

    passport.deserializeUser((id, done)=>{
        User.findById(id,(err,user)=>{
            done(err,user)
        })
    })
}