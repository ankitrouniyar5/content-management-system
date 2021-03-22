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

//POST product gallery
router.post('/product-gallery/:id',(req,res)=>{
    
    let productImage = req.files.file;
    let id = req.params.id;
    let path = `public/product_images/${id}/gallery/` + req.files.file.name;
    let thumbsPath = `public/product_images/${id}/gallery/thumbs/` + req.files.file.name;


    productImage.mv(path,(err)=>{
        if(err) {
            console.log(err)
        }else{

        resizeImg(fs.readFileSync(path),{
            width:100,
            height:100
        }).then(function(buf){
            fs.writeFileSync(thumbsPath,buf);
        })
    }
    })

    res.sendStatus(200)
    
})

//get delete images

router.get('/delete-image/:image', (req,res)=>{

    let originalImage = `public/product_images/` + req.query.id+ `/gallery/` + req.params.image;
    let thumbImage = `public/product_images/` + req.query.id + `/gallery/thumbs/` + req.params.image;

        fs.unlink(thumbImage,(err)=>{
            if(err){
                console.log(err)
            }else{
                fs.unlink(originalImage,(err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        req.flash('success','Image Deleted')
                        res.redirect('/admin/products/edit-product/'+ req.query.id)
                    }
                })
                    
                }
            }
        )
        
    
    

   
}
)




router.get('/reorder-pages',async (req,res)=>{
    
    
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


//delete product

router.get('/delete-product/:id',(req,res)=>{
    
   let id = req.params.id;
   let path = 'public/product_images/' + id

   fs.rm(path,{recursive : true ,force : true},(err)=>{
       if(err){
        console.log(err);
       }else{
           Product.findByIdAndRemove(id,(err)=>{
               if(err){
                   console.log(err)
               }else{
                req.flash('success','Product Deleted')
                res.redirect('/admin/products/')
               }

           })
       }
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
            var galleryDir = 'public/product_images/' + p._id + '/gallery/thumbs'
            var galleryImages = null;

            fs.readdir(galleryDir,(err,files)=>{
                if(err){
                    console.log(err)
                }else{
                    galleryImages = files;
                    res.render('admin/edit_product',{
                        title : p.title,
                        desc : p.desc,
                        categories,
                        category : p.category.replace(/\s+/g,'-').toLowerCase(),
                        errors : errors,
                        price : parseFloat(p.price).toFixed(2),
                        image:p.image,
                        galleryImages : galleryImages,
                        id : p._id
                    })

                }
            })


        }
    })
   
    

})
router.post('/edit-product/:id',(req,res)=>{

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
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.redirect(`/admin/products/edit-product/${id}`)
    }else{
        Product.findOne({slug,_id:{'$ne':id}},(err,p)=>{
            if(err){
                console.log(err);
            }
            if(p){
                req.flash('danger','Product title exists , Choose another one')
                res.redirect(`/admin/products/edit-product/` + id )
            }else{
                Product.findById(id,(err,p)=>{
                    if(err){
                        console.log(err)
                    }
                        p.title = title
                        p.slug = slug
                        p.desc = desc
                        p.price = parseFloat(price).toFixed(2)
                        p.category = category
                        if(imageFile){
                            p.image = imageFile
                        }
                        p.save((err)=>{
                            if(err){
                                console.log(err)
                            }

                            if(imageFile != ""){
                                if(pimage != ""){
                                    fs.unlink(`public/product_images/${id}/${pimage}`,(err)=>{
                                        console.log(err)
                                    })
                                }
                                if(imageFile != ""){
                                    var productImage = req.files.image
                                    var path = 'public/product_images/' + id +'/'+imageFile;
        
                                    productImage.mv(path,(err)=>{
                                        return console.log(err)
                                    })
                                }
                            
                            }
                            req.flash('success','Product Edited!')
                            res.redirect(`/admin/products/edit-product/${id}`)

                            ///////////////////
                        })

                        
                })
            }
        })
    }
  
})

module.exports = router