const express = require("express")

const router = express.Router()

//Page Model

const Page = require('../models/page');

router.get('/',async(req,res)=>{

    try {
        
        page = await Page.findOne({slug :'home'})
        res.status(200).render('index',{
        title : page.title,
        content : page.content
    })
    } catch (error) {
        res.status(500).send('Some error')
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