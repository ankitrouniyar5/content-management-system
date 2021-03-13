const express = require('express')
const path = require('path')

//initialize app

const app = express()

//setting up view engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

//seting up public folder 
app.use(express.static(path.join(__dirname,'public')))

const port = process.env.PORT || 3000


app.get('/', (req,res)=>{

    res.send("<h1>hi</h1>")
})
app.listen(port,()=>{

    console.log('Server up and running on ' + port)

})






