const express = require("express")
const router = express.Router()
const fs = require('fs')
const mkdirp = require('mkdirp')
const resizeImg = require('resize-img')

const Product = require('../models/product')
const Category = require('../models/category')
//Get product index
router.get('/',async (req,res)=>{

    try {
        count = await Product.countDocuments();

        products = await Product.find();
        res.render('admin/products',{
            products,
            count
        })
    } catch (error) {
        
    }
   
})

router.get('/add-product',async (req,res)=>{

    var desc=""
    var title=""
    var price =""

    try {
        categories = await Category.find()
        res.render('admin/add_product',{
            title,
            desc,
            price,
            categories
        })
    } catch (error) {
        console.log(error)
    }
    
})


router.post('/add-product',async (req,res)=>{

    if(!req.files){ 
        imageFile =""; 
    }
   if(req.files){
   var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
   }
    req.checkBody('title',"Title cannot be empty").notEmpty()
    req.checkBody('desc',"Description cannot be empty").notEmpty();
    req.checkBody('price',"Price must have a value").isDecimal();
    req.checkBody('image',"You must upload an image").isImage(imageFile)

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    
    var errors = req.validationErrors();

    if(errors){
        Category.find(function(err,categories){
            res.render('admin/add_product',{
                title,
                desc,
                price,
                categories,
                errors
            })
        })
        
    }else{
        categories = await Category.find()
        Product.findOne({slug : slug},(err,product)=>{

            if(product){

                req.flash('danger','The product title is already used.Please try another one.')
                res.render('admin/add_product',{
                    title,
                    desc,
                    price,
                    categories
                })

            }else{
                var price2 = parseFloat(price).toFixed(2)
                var product = new Product({
                    title,
                    desc,
                    price : price2,
                    slug,
                    image : imageFile,
                    category : category
                });

                product.save(function (err){
                    if(err){
                        return console.log(err)
                    }else{

                        mkdirp('public/product_images/'+ product._id,(err)=>{
                            return console.log(err)
                        })
                        mkdirp('public/product_images/'+ product._id + '/gallery',(err)=>{
                            return console.log(err)
                        })
                        mkdirp('public/product_images/'+product._id + '/gallery/thumbs',(err)=>{
                            return console.log(err)
                        })
                        if(imageFile != ""){
                            var productImage = req.files.image
                            var path = 'public/product_images/' + product._id +'/'+imageFile;

                            productImage.mv(path,(err)=>{
                                return console.log(err)
                            })
                        }
                        req.flash('success','Product added!')
                        res.redirect('/admin/products')
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

        req.flash('success','Page was sucessfully deleted')
        res.redirect('/admin/pages')
    })
})

router.get('/edit-product/:id',async (req,res)=>{
    
    var errors;
    if (req.session.errors ){
        errors = req.session.errors
    }
    req.session.errors = null

    categories = await Category.find();
    Product.findById(req.params.id,(err,p)=>{
        if(err){
            console.log(err)
            res.redirect('admin/products')
        }else{
            var galleryDir = 'public/product_images/' + p._id + '/gallery'
            var galleryImages = null;

            fs.readdir(galleryDir,(err,files)=>{
                if(err){
                    console.log(err)
                }else{
                    galleryImages = files;
                    res.render('admin/add_product',{
                        title : p.title,
                        desc : p.desc,
                        categories,
                        category : p.category.replace(/\s+/g,'-').toLowerCase(),
                        errors : errors,
                        price : p.price,
                        image:p.image,
                        galleryImages : galleryImages
                    })

                }
            })


        }
    })
   
    

})
router.post('/edit-product/:id',(req,res)=>{

    req.checkBody('content',"Content cannot be empty").notEmpty();
    req.checkBody('title',"Title cannot be empty").notEmpty()
    var title = req.body.title;
    var id = req.params.id;
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
                            res.redirect('/admin/pages/edit-page/'+id);    
                        })
                    }
                })
            }
        })
    }
  
})

module.exports = router