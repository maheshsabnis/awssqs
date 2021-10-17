const express = require('express');
 
const AWS = require('aws-sdk');

// Configure the region 
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = "https://sqs.us-east-1.amazonaws.com/472804039072/SQS_QUEUE_URL_ORDER";

const port =  process.argv.slice(2)[0];
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to NodeShop Orders.")
});

app.post('/order', (req, res) => {

    let orderData = {
        'messageId':req.body.messageId,
        'userEmail': req.body.userEmail,
        'itemName': req.body.itemName,
        'itemPrice': req.body.itemPrice,
        'itemsQuantity': req.body.itemsQuantity
    }
    console.log(`Receivdd MEssage ${JSON.stringify(orderData)}`);

    let sqsOrderData = {
        MessageAttributes: {
          "userEmail": {
            DataType: "String",
            StringValue: orderData.userEmail
          },
          "itemName": {
            DataType: "String",
            StringValue: orderData.itemName
          },
          "itemPrice": {
            DataType: "Number",
            StringValue: orderData.itemPrice
          },
          "itemsQuantity": {
            DataType: "Number",
            StringValue: orderData.itemsQuantity
          }
        },
        MessageBody: JSON.stringify(orderData),
       // MessageDeduplicationId: req.body.messageId.toString(),
       // MessageGroupId: "UserOrders",
        QueueUrl: queueUrl
    };

    // send the order data to the SQS queue
    
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
    
    sendSqsMessage.then((data) => {
        console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
        res.send("Thank you for your order. Check you inbox for the confirmation email.");
    }).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);
        // send email to emails API
        res.send("We ran into an error. Please try again.");        
    });
});

console.log(`Orders service listening on port ${port}`);
app.listen(port);