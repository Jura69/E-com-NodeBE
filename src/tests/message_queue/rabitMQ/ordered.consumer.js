'use strict';

const amqp = require('amqplib');

async function consumerOrderedMessage() {
    const connection = await amqp.connect('amqp://user:password@localhost')
    const channel = await connection.createChannel()

    const queueName = 'ordered-queued-message';
    await channel.assertQueue(queueName, { durable: true });

    // Set prefetch count to 1 to ensure ordered processing
    // This means the consumer will only receive one message at a time
    // and will not receive another until it acknowledges the previous one
    // This is important for ordered message processing
    channel.prefetch(1)

    channel.consume(queueName, msg => {
        const message = msg.content.toString();
        setTimeout(() => {
            console.log('processed: ', message);
            channel.ack(msg);
        }, Math.random() * 1000);
    });

}

consumerOrderedMessage().catch((err) => console.error(err));
