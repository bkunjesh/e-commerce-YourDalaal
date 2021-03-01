const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const methodOverride = require('method-override');
const Item = require('./models/item')
const ejsMate=require('ejs-mate')



mongoose.connect('mongodb://localhost:27017/your-dalaal', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

app = express();

console.log(__dirname);
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '\\..\\client\\views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))



app.get('/', (req, res) => {
    res.render('home');
})

app.get('/yourdalaal', async (req, res) => {
    const items =await Item.find({});
    // console.log(items);
    res.render('yourdalaal/index',{items})
})

app.get('/yourdalaal/new', (req, res) => {
    res.render('yourdalaal/new')
})

app.get('/yourdalaal/:itemId', async (req, res) => {
    
    const item = await Item.findById(req.params.itemId);
    res.render('yourdalaal/show',{item});
})

app.get('/yourdalaal/:itemId/edit', async (req, res) => {
    const item=await Item.findById(req.params.itemId)
    res.render('yourdalaal/edit',{item});
})

app.post('/yourdalaal', async (req, res) => {
    const item = new Item(req.body);
    await item.save();
    res.redirect(`/yourdalaal/${item._id}`);
})

app.put('/yourdalaal/:itemId', async (req, res) => {
    // console.log(...req.body);
    await Item.findByIdAndUpdate(req.params.itemId, { ...req.body })
    res.redirect(`/yourdalaal/${req.params.itemId}`)
})

app.delete('/yourdalaal/:itemId', async (req, res) => {
    
    await Item.findByIdAndDelete(req.params.itemId)
    res.redirect('/yourdalaal')

})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})