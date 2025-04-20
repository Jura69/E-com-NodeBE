const amqp = require('amqplib');
const messages = 'new a product: Title abcassd';

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost')
    const channel = await connection.createChannel()

    const notificationExchange = 'notificationEx'; // notificationEx direct
    const notiQueue = 'notificationQueueProcess'; // assertQueue
    const notificationExchangeDLX = 'notificationExDLX'; // notificationEx direct
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'; // assert

    // 1. create Excahnge
    await channel.assertExchange(notificationExchange, 'direct', { durable: true });

    // 2. create Queue
    const queueResult = await channel.assertQueue(notiQueue, {
      exclusive: false, // cho phep cac ket noi truy cap vao cung mot luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX
    });

    // 3. bindQueue
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. Send message
    const msg = 'a new product';
    console.log(`producder msg :: `, msg);
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '10000' // 10s
    })
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(`erro :: `, error);
  }
};

runProducer().then(rs => console.log(rs)).catch(console.error);
