import express, { Express, Request, Response } from "express";
import amqp from "amqplib";

const app = express();
app.use(express.json());

const queue='messages'

app.post("/", (req: Request, res: Response) => {
  const body = req.body;

  (async () => {
    let connection;
    try {
      connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      await channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(body)));
      console.log(" [x] Sent '%s'", body);
      await channel.close();
      res.status(200).send("Request received and sent successfully");
    } catch (err) {
      console.warn(err);
    } finally {
      if (connection) await connection.close();
    }
  })();

});

app.listen('5000', () => {
    console.log(`the server is listening to port: 5000`);
});