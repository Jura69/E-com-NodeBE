"use strict";

const { SuccessResponse } = require("../core/success.response");
const { product } = require("../models/product.model");
const ProductService = require("../services/product.service");

class ProductController {

  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);

  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "publishProductByShop success",
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublishProductByShop success",
      metadata: await ProductService.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }


  // query 
  /**
 * @description get all drafts for shop
 * @param {number} limit
 * @param {number} skip
 * @return {JSON}
 */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list success!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      })
    }).send(res);
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get AllPublishForShop success!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      })
    }).send(res);
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get ListSearchProduct success!",
      metadata: await ProductService.searchProducts(req.params)
    }).send(res);
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get findAllProducts success!",
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res);
  }

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get findProduct success!",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res);
  }

  // end query
}

module.exports = new ProductController();
