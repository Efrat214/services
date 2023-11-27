import amqp from "amqplib";
import fspromises from "fs/promises"
const queue = "messages";

(async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });
    await channel.consume(
      queue,
      async (message) => {
        if (message) {
            await fspromises.appendFile('logs.txt', message.content.toString('utf8') + '\n');
            console.log(
            " [x] Received '%s'",
            message.content.toString()
          );
        }
      },
      { noAck: true }
    );

    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  } catch (err) {
    console.warn(err);
  }
})();
