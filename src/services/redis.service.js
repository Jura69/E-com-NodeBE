'use strict'
const { reservationInventory } = require('../models/repositories/inventory.repo')
const { getRedis } = require('../dbs/init.redis')

const acquireLock = async (productId, quantity, cartId) => {
    const { instance: redisClient } = getRedis();
    const key = `lock_v2025_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds tam lock

    for (let i = 0; i < retryTimes; i++) {
        // tao mot key, thang nao nam giu duoc vao thanh toan 
        const result = await redisClient.setNX(key, expireTime);
        console.log(`result: : : `, result);
        
        if (result === 1) {
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                productId,
                quantity,
                cartId
            });

            if (isReversation.modifiedCount) {
                await redisClient.pExpire(key, expireTime);
                return key;
            }

            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async keyLock => {
    const { instance: redisClient } = getRedis();
    return await redisClient.del(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock,
}
