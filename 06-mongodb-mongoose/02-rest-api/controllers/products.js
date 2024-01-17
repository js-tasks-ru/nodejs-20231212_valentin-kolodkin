const Product = require('../models/Product');
const productMapper = require('../mappers/product');
const mongoose = require('mongoose');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const products = await Product.find({subcategory: subcategory});

  ctx.body = {
    products: products.map(productMapper),
  };
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find({});

  ctx.body = {
    products: products.map(productMapper),
  };
};

module.exports.productById = async function productById(ctx, next) {
  if (!mongoose.isValidObjectId(ctx.params.id)) {
    ctx.throw(400, 'Bad request');
  }

  const product = await Product.findById(ctx.params.id);
  if (!product) {
    ctx.throw(404, 'Product with id ' + ctx.params.id + ' not found');
  }

  ctx.body = {
    product: productMapper(product),
  };
};
