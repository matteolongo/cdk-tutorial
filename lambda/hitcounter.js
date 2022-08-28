const {DynamoDB, Lambda} = require('aws-sdk');

exports.handler = async (event) => {
    console.log("request:", JSON.stringify(event, undefined, 2))

    // create clients
    //FIXME configure endpoint as env var
    const dynamo = new DynamoDB({endpoint: "http://localstack:4566"});
    const lambda = new Lambda({endpoint: "http://localstack:4566"});

    // call downstream function and capture response
    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME,
        Key: {path: {S: event.path}},
        UpdateExpression: 'ADD hits :incr',
        ExpressionAttributeValues: {':incr': {N: '1'}}
    }).promise()

    const resp = await lambda.invoke({
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
        Payload: JSON.stringify(event)
    }).promise()

    console.log("Downstream response:", JSON.stringify(resp, undefined, 2))

    // return the response back to the upstream caller
    return JSON.parse(resp.Payload)
}