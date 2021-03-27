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

    res.render('checkout',{
        title : 'Checkout',
        cart : req.session.cart  
    })
   
})
module.exports = router