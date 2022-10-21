const Product = require('../models/product');
const Cart = require('../models/cart');
const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.json({products, sucess: true});
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page;
  let totalItems;

  Product.count()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.findAll({
          offset: (page - 1)*(ITEMS_PER_PAGE), 
          limit: ITEMS_PER_PAGE
        });
    })
    .then(limitedProducts => {
      // res.render('shop/index', {
      //   prods: products,
      //   pageTitle: 'Shop',
      //   path: '/'
      // });
      res.status(200).json({
        products: limitedProducts,
        totalProducts: totalItems,
        currentPage: page,
        hasNextPage: (page*ITEMS_PER_PAGE) < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          // res.render('shop/cart', {
          //   path: '/cart',
          //   pageTitle: 'Your Cart',
          //   products: products
          // });
          res.json({products: products, sucess: true});
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  console.log('post req called');

  //res.status(200).json({sucess: true});
  const prodId = req.body.id;
  if(!prodId) {
    res.status(400).json({success: false, message: 'product Id missing'});
  }
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: {id: prodId}});
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }
      if(product){
        let oldQuantity = product.cartItem.quantity
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: {quantity: newQuantity}
      });
    })
    .then(() => {
      res.status(200).json({success: true, message: 'product added to cart'});
    })
    .catch(err => {
      res.status(500).json({success: false, message: err});
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where: {id: prodId}});
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
