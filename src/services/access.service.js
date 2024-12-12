'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getIntoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")


const RoleShop = {
    SHOP: 'SHOP',
    WRITTER: 'WRITTER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {

    static logIn = async ({ email, password, refreshToken = null}) => {
        //check email in db
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registerd')
        
        //match password
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')

        //create AT vs RT and save
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        //generate tokens
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey,
        })
        //get data return login
        return {
            shop: getIntoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }), 
            tokens
        }

    }

    static signUp = async ({ name, email, password }) => {
        //check email exists
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // create private, public key
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            const keyStore = await KeyTokenService.createKeyToken(newShop._id, publicKey, privateKey);

            if (!keyStore) {
                throw new BadRequestError('Error: keyStore error!')
            }

            // create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            return {
                code: 201,
                metadata: {
                    shop: getIntoData({
                        fields: ['_id', 'name', 'email'],
                        object: newShop
                    }),
                    tokens
                }
            }
        }
    }
}

module.exports = AccessService