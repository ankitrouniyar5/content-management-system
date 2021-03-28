const express = require("express")
const Category = require('../models/category')
const router = express.Router()
const auth = require('../config/auth')
const isAdmin = auth.isAdmin 


//get categorie index
router.get('/',isAdmin,(req,res)=>{
   
    Category.find((err,categories)=>{
        if(err) {
            return console.log(err)
        }
        res.render('admin/categories',{
            categories
        })

    })
})

router.get('/add-category',isAdmin,(req,res)=>{

    var title=""

    res.render('admin/add_category',{
        title
    })
})


router.post('/add-category',(req,res)=>{

    req.checkBody('title',"Title cannot be empty").notEmpty()
    var title = req.body.title;

    var slug = title.replace(/\s+/g,'-').toLowerCase();

    var errors = req.validationErrors();

    if(errors){
            res.render('admin/add_category',{
            errors: errors,
            title: title,
        })
    }else{
        Category.findOne({slug : slug},(err,category)=>{

            if(category){

                req.flash('danger','The slug is already used.Please try another one.')
                res.render('admin/add_category',{
                    title : title,
                })

            }else{

                var category = new Category({
                    title : title,

                    slug : slug,
        
                });

                category.save(function (err){
                    if(err){
                        return console.log(err)
                    }else{
                        Category.find((err,categories)=>{
                            if(err) return console.log(err);
                            
                            req.app.locals.categories = categories
                        })
                        req.flash('success','Category added!')
                        res.redirect('/admin/categories')
                    }
                })
            }
        })
    }

})


router.get('/delete-category/:id',isAdmin,async (req,res)=>{
    try {
        await Category.findByIdAndRemove(req.params.id)
        await Category.find((err,categories)=>{
            if(err) return console.log(err);
            
            req.app.locals.categories = categories
        })
        req.flash('sucess','Page was sucessfully deleted')
        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error)
    }
    })

router.get('/edit-category/:id',isAdmin,async (req,res)=>{
    
    try {
        cat = await Category.findById(req.params.id)
        
        res.render('admin/edit_category',{
            title : cat.title,
            id : cat._id,
        })

    } catch (error) {
        console.log(error)
    }
    
})

router.post('/edit-category/:id',(req,res)=>{

    req.checkBody('title',"Title cannot be empty").notEmpty()
    var title = req.body.title;
    var id = req.params.id;
    var slug = title.replace(/\s+/g,'-').toLowerCase();


    var errors = req.validationErrors();

    if(errors){
            res.render('admin/edit_category',{
            errors: errors,
            title: title,
            id : id 
        })
    }else{
        Category.findOne({slug : slug, _id : {'$ne': id}},(err,cat)=>{

            if(cat){

                req.flash('danger','The category title is already used.Please try another one.')
                res.render('admin/edit_category',{
                    title : title,
                    id : id
                })

            }else{
               
                Category.findById(id,(err,cat)=>{
                    if(err){
                        return console.log(err)
                    }else{
                        cat.title = title;
                        cat.slug = slug;

                        cat.save(function(err){
                            if(err)
                                return console.log(err)
                            
                                Category.find((err,categories)=>{
                                    if(err) return console.log(err);
                                    
                                    req.app.locals.categories = categories
                                })    

                            req.flash('success','Category Updated')
                            res.redirect('/admin/categories/edit-category/'+id);    
                        })
                    }
                })
            }
        })
    }
  
})

module.exports = router