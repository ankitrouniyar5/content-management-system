const express = require("express")

const router = express.Router()

//Product Model
const Product = require('../models/product');

//get add product to cart

router.get('/add/:product',async(req,res)=>{

    try {
        p = await Product.findOne({slug :req.params.product})

        if(typeof req.session.cart === 'undefined'){
            req.session.cart = [];
            req.session.cart.push({
                title : req.params.product,
                qty : 1,
                price : parseFloat(p.price).toFixed(2),
                image : `/product_images/${p._id}/${p.image}`
            })
        }else{
            let cart = req.session.cart;
            let newItem = true;

           for (let i = 0; i < cart.length; i++) {
               if(cart[i].title == req.params.product){
                   cart[i].qty++;
                   newItem = false;
                   break
               }
               
           }

            if(newItem){
                    cart.push({
                    title : req.params.product,
                    qty : 1,
                    price : parseFloat(p.price).toFixed(2),
                    image : `/product_images/${p._id}/${p.image}`
                })
            }
            
        }
        
            req.flash('success','Product added')
            res.redirect('back')
    } catch (error) {

        console.log(error)
    }



})


//get checkout page
router.get('/checkout',async (req,res)=>{

    if(req.session.cart && req.session.cart.length ==0){
        delete req.session.cart;
        req.flash('success','Cart Updated')
        res.redirect('/cart/checkout')

    }else{
    res.render('checkout',{
        title : 'Checkout',
        cart : req.session.cart  
    })
}
   
})

//get update product

router.get('/update/:product',(req,res)=>{
    
    slug = req.params.product
    cart = req.session.cart
    action = req.query.action
    console.log(action)

    for (let i = 0 ; i < cart.length ; i++) {
        if(cart[i].title == slug){
            switch(action){
                case "add":
                    req.session.cart[i].qty++
                    break
                case "remove":
                    req.session.cart[i].qty--
                    if(req.session.cart[i].qty < 1) req.session.cart.splice(i,1);
                    break
                case "clear":
                    req.session.cart.splice(i,1);
                    if(cart.length == 0) delete req.session.cart;
                    break;  
                default:
                    console.log('Invalid Action')   
            }
            break;
        }
    }

    req.flash('success','Cart Updated')
    res.redirect('/cart/checkout')
})


router.get('/clear',(req,res)=>{

    try {
        delete req.session.cart
        req.flash('success','Cart Cleared')
        res.redirect('/cart/checkout')  
    } catch (error) {
        console.log(error)
    }


})
module.exports = router