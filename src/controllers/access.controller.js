'use strict'

const { CREATED, SuccessResponse} = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse ({
      message: 'Get token success',
      metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
    }).send(res)
  }

  logOut = async (req, res, next) => {
    new SuccessResponse ({
      message: 'Logout success',
      metadata: await AccessService.logOut(req.keyStore)
    }).send(res)
  }

  logIn = async (req, res, next) => {
    new SuccessResponse ({
      metadata: await AccessService.logIn(req.body)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      metadata: await AccessService.signUp(req.body)
    }).send(res)
  }
}

module.exports = new AccessController();

