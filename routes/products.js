const express = require("express")
const fs = require("fs-extra")
const router = express.Router()

//Page Model

const Product = require('../models/product');
const Category = require('../models/category');
const { fstat } = require("fs-extra");


router.get('/',async(req,res)=>{

    try {
        
        products = await Product.find();
        res.status(200).render('all_products',{
        title : 'All products',
        products
    })
    } catch (error) {
        res.status(500).send('Some error')
    }
    
  
})

//get product by category
router.get('/:category',async(req,res)=>{

    try {
        catSlug =req.params.category; 
        c = await Category.findOne({slug : catSlug});

        products = await Product.find({category : catSlug});
        res.status(200).render('cat_products',{
        title : c.title,
        products
    })
    } catch (error) {
        console.log(error)
        res.status(500).send()

    }
    
  
})

//get product details 
router.get('/:category/:product',async(req,res)=>{

        try {
            galleryImages = null
            prod = await Product.findOne({slug :req.params.product})
            galleryDir = `public/product_images/${prod._id}/gallery`
            
            fs.readdir(galleryDir,(err,files)=>{
                if(err) return console.log(err)

                galleryImages = files;
                res.render('product',{
                    title : prod.title,
                    p : prod,
                    galleryImages
                })
            })
        } catch (error) {
            console.log(error)
        }
       
})


router.get('/:slug',async (req,res)=>{
    try {

    let slug = req.params.slug
    page = await Page.findOne({slug})
    res.status(200).render('index',{
        title : page.title,
        content : page.content
    })
        
    } catch (error) {
        res.status(404).send('Page not found');
    }
    
})

module.exports = router