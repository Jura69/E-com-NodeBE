'use strict'

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error creating token pair:', error);
    throw new Error('Token creation failed');
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid Request');

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not Found Keystore');

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    console.log('Verifying token with public key:', keyStore.publicKey);
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    console.log('Decoded user:', decodeUser);
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new AuthFailureError('Invalid Token');
  }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};