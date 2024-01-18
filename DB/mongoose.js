// const mongoose = require("mongoose");
// const Product = require("../models/product");

// mongoose
//   .connect(
//     "mongodb+srv://kambojmail:Diamond123@cluster0.stpqepl.mongodb.net/product_test?retryWrites=true&w=majority"
//   )
//   .then(() => {
//     console.log("Connected to Database !");
//   }).catch((error)=>{
//         console.log("Connection Failed."+error);
//   });

// const createProduct = async (req, res, next) => {
//   const createdProduct = new Product({
//     name: req.body.name,
//     price: req.body.price,
//   });
//   const result = await createdProduct.save();
//   res.json(result);
// };

// const getProducts = async (req, res, next) =>{
//     const products = await Product.find().exec();
//     res.json(products);
// }

// exports.createProduct = createProduct;
// exports.getProducts = getProducts;
