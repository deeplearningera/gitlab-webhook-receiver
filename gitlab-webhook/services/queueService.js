const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({ region: "ap-south-1" });

exports.sendToQueue = async (payload) => {
  const command = new SendMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify(payload),
  });

  try {
    await sqsClient.send(command);
    console.log("📤 Sent to AI Analyzer:", payload.mr_id);
  } catch (err) {
    console.error("❌ Error sending to queue:", err);
  }
};

