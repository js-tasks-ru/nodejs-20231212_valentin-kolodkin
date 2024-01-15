const Category = require('../models/Category');
const categoryMapper = require('../mappers/category');

module.exports.categoryList = async function categoryList(ctx, next) {
  const mappedCategories = [];
  const categories = await Category.find({});
  categories.forEach(function(row) {
    mappedCategories.push(categoryMapper(row));
  });

  ctx.body = {
    categories: mappedCategories,
  };
};
