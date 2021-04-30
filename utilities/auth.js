exports.isUser = (req,res,next) => {

    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('danger','You are not logged in.')
        res.redirect('/user/login')
    }
}

exports.isAdmin = (req,res,next) => {

    if(req.isAuthenticated() && res.locals.user.admin == 1){
        next();
    }else{
        req.flash('danger','You are not admin')
        res.redirect('/user/login')
    }
}