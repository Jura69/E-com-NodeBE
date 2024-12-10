'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getIntoData } = require("../utils")


const RoleShop = {
    SHOP : 'SHOP',
    WRITTER : 'WRITTER',
    EDITOR : 'EDITOR',
    ADMIN : 'ADMIN',
}

class AccessService {

    static signUp = async ({name, email, password}) => {
        try {
            //check email exists
            const holderShop = await shopModel.findOne({email}).lean()
            if(holderShop){
                return {
                    code: 'xxx',
                    message: 'Shop already registed!'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10)

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles :[RoleShop.SHOP]
            })

            if(newShop){
                // create private, public key
                /* const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    } 
                }) */
                const privateKey = crypto.getRandomValues(64).toString('hex');
                const publicKey = crypto.getRandomValues(64).toString('hex');

                console.log({privateKey, publicKey})

                const keyStore = await KeyTokenService.createKeyToken(newShop._id, publicKey, privateKey);
                   
                if(!keyStore){ 
                    return{
                        code: 'xxxx',
                        status: 'keyStore error'
                    }
                }

                // create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Create Token Success::`, tokens)

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
                //const tokens = await
            }

            return {
                code: 200,
                metadata: null
            }

        }catch (error){
            return{
                code: 'xxx',
                message:  error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService