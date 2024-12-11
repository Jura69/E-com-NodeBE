'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getIntoData } = require("../utils")
const { BadRequestError } = require("../core/error.response")


const RoleShop = {
    SHOP: 'SHOP',
    WRITTER: 'WRITTER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {

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