const express = require("express")
const Page = require('../models/page')
const router = express.Router()

router.get('/',(req,res)=>{
    Page.find({}).sort({sorting  :1}).exec((err,pages)=>{
        res.render('admin/pages',{
            pages,
        })
    })
})

router.get('/add-page',(req,res)=>{

    var slug=""
    var title=""
    var content =""

    res.render('admin/add_page',{
        title,
        slug,
        content
    })
})


router.post('/add-page',(req,res)=>{

    
    req.checkBody('content',"Content cannot be empty").notEmpty();
    req.checkBody('title',"Title cannot be empty").notEmpty()
    var title = req.body.title;

    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();

    if (slug == ""){
        slug = title.replace(/\s+/g,'-').toLowerCase();
    }

    var content = req.body.content;

    var errors = req.validationErrors();

    if(errors){
            res.render('admin/add_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }else{
        Page.findOne({slug : slug},(err,page)=>{

            if(page){

                req.flash('danger','The slug is already used.Please try another one.')
                res.render('admin/add_page',{
                    title : title,
                    content : content,
                    slug : slug
                })

            }else{

                var page = new Page({
                    title : title,
                    content : content,
                    slug : slug,
                    sorting : 100
                });

                page.save(function (err){
                    if(err){
                        return console.log(err)
                    }else{
                        req.flash('sucess','Page added!')
                        res.redirect('/admin/pages')
                    }
                })
            }
        })
    }

})

router.post('/reorder-pages',async (req,res)=>{
    
    
    var ids = req.body.id
    count = 0;
    ids.forEach(async (id) => {
        count++;
        try {
            page = await Page.updateOne({_id:id},{sorting  : count});
        
        } catch (error) {
            return console.log(error)
        }
    });
})

router.get('/delete-page/:id',(req,res)=>{
    
    Page.findByIdAndRemove(req.params.id,(err,page)=>{
        if(err)
        return console.log(err);

        req.flash('sucess','Page was sucessfully deleted')
        res.redirect('/admin/pages')
    })
})

router.get('/edit-page/:slug',async (req,res)=>{
    
    try {
        page = await Page.findOne({slug : req.params.slug})
        res.render('admin/edit_page',{
            title : page.title,
            content : page.content,
            slug : page.slug,
            id : page._id,
        })

    } catch (error) {
        console.log(error)
    }
    

})
router.post('/edit-page/:slug',(req,res)=>{

    req.checkBody('content',"Content cannot be empty").notEmpty();
    req.checkBody('title',"Title cannot be empty").notEmpty()
    var title = req.body.title;
    var id = req.body.id;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();

    if (slug == ""){
        slug = title.replace(/\s+/g,'-').toLowerCase();
    }

    var content = req.body.content;

    var errors = req.validationErrors();

    if(errors){
            res.render('admin/edit_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id : id 
        })
    }else{
        Page.findOne({slug : slug, _id : {'$ne': id}},(err,page)=>{

            if(page){

                req.flash('danger','The slug is already used.Please try another one.')
                res.render('admin/edit_page',{
                    title : title,
                    content : content,
                    slug : slug,
                    id : id
                })

            }else{
               
                Page.findById(id,(err,page)=>{
                    if(err){
                        return console.log(err)
                    }else{
                        page.title = title;
                        page.content = content;
                        page.slug = slug;

                        page.save(function(err){
                            if(err)
                                return console.log(err)

                            req.flash('success','Page updated')
                            res.redirect('/admin/pages/edit-page/'+page.slug);    
                        })
                    }
                })
            }
        })
    }
  
})

module.exports = router