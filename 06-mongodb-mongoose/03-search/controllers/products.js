const Product = require('../models/Product');
const productMapper = require('../mappers/product');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const query = ctx.request.query.query;

  if (!query) {
    ctx.throw(400, 'Bad request');
  }

  const products = await Product.find({
    $text: {
      $search: query,
    },
  });

  ctx.body = {
    products: products.map(productMapper),
  };
};
