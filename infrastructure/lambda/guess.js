const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { id, guessIndex } = body;
    
    if (id === undefined || guessIndex === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required parameters: id and guessIndex' })
      };
    }
    
    // Get the item from DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };
    
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }
    
    const item = result.Item;
    const lieIndex = item.lieIndex;
    
    // Check if the guess is correct
    const isCorrect = guessIndex === lieIndex;
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correct: isCorrect,
        message: isCorrect 
          ? 'Correct! You found the lie!' 
          : 'Sorry, that\'s not the lie.',
        correctAnswer: isCorrect ? undefined : lieIndex
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to process guess' })
    };
  }
};