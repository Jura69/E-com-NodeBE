"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
/*
Key features: Cart Service
    - add product to cart [user]
    - reduce product quantity by one [User]
    - increase product quantity by One [User]
    - get cart [User]
    - Delete cart [User]
    - Delete cart item [User]
*/
class CartService {
  /// START REPO CART ////
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  /// END REPO CART ////

  static async addToCart({ userId, product = {} }) {
    // Find the user's cart
    const userCart = await cart.findOne({
      cart_userId: userId,
      cart_state: "active",
    });

    if (!userCart) {
      // Create a new cart if it doesn't exist
      return await CartService.createUserCart({ userId, product });
    }

    // If the cart exists but is empty, add the product
    if (!userCart.cart_products.length) {
      userCart.cart_products.push(product);
      return await userCart.save();
    }

    // Check if the product already exists in the cart
    const productExists = userCart.cart_products.some(
      (p) => p.productId.toString() === product.productId,
    );

    if (productExists) {
      // Update the quantity if the product exists
      return await CartService.updateUserCartQuantity({ userId, product });
    } else {
      // Add the product to the cart if it doesn't exist
      userCart.cart_products.push(product);
      return await userCart.save();
    }
  }

  /*
    // update cart
    shop_order_ids: [ {
        shopId,
        item_products: [
            {
                quantity,
                price,
                shopId,
                old_quantity:,
                productId
            },
            version
        ]
    }]
    */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    //check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("");
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Product do not belong to the shop");
    }

    if (quantity === 0) {
      // deleted
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
