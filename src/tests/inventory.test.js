const redisPubsubService = require('../services/redisPubsub.service');

class InventoryService {
  constructor() {
    redisPubsubService.subscribe('purchase_events', (channel, message) => {
      console.log('Received message:', message);
      InventoryService.updateInventory(message);
    });
  }

  static updateInventory({productId, quantity}) {
    // Update inventory logic
    console.log(`[0001]: Updated inventory for Product ID ${productId}: Quantity ${quantity}`);
  }
}

module.exports = new InventoryService();
