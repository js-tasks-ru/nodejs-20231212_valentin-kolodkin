const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
  const user = ctx.user;
  const product = ctx.request.body.product;
  const phone = ctx.request.body.phone;
  const address = ctx.request.body.address;

  const order = new Order({
    user: user._id,
    product: product,
    phone: phone,
    address: address,
  });

  try {
    await order.validate();
  } catch (error) {
    let errors = {};

    Object.keys(error.errors).forEach((field) => {
      errors[field] = error.errors[field].message;
    });

    ctx.response.status = 400;
    ctx.response.body = {
      errors,
    };

    return next();
  }

  await order.save();

  await sendMail({
    to: user.email,
    subject: 'Подтверждение заказа',
    template: 'order-confirmation',
    locals: {
      id: order._id,
      product,
    },
  });

  ctx.response.status = 201;
  ctx.response.body = {
    status: 'ok',
    order: order._id,
  };
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({
    user: ctx.user._id,
  });

  ctx.response.body = {
    orders: orders.map(mapOrder),
  };
};
