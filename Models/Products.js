const mongoose=require('mongoose')
const Category = require('./Category')

const productSchema=new mongoose.Schema({
    name:({type:String,required:true}),
    price:({type:Number,required:true}),
    description:({type:String,required:true}),
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }})

module.exports=mongoose.model('Product',productSchema)