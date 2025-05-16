const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

// Sample data to return if no data is found in the database
const sampleData = {
  id: 'sample-1',
  person: 'Aryan',
  facts: [
    'I have climbed Mount Kilimanjaro.',
    'I once met Bill Gates at a conference.',
    'I can speak five languages fluently.'
  ],
  lieIndex: 1 // The second statement is the lie
};

exports.handler = async (event) => {
  try {
    // Try to get a random item from the database
    const params = {
      TableName: TABLE_NAME,
      Limit: 10 // Get up to 10 items to randomly select from
    };
    
    let data;
    
    try {
      const result = await dynamoDB.scan(params).promise();
      
      if (result.Items && result.Items.length > 0) {
        // Randomly select one item
        const randomIndex = Math.floor(Math.random() * result.Items.length);
        data = result.Items[randomIndex];
      } else {
        // If no items found, use sample data
        data = sampleData;
        
        // Also insert the sample data into the database for future use
        await dynamoDB.put({
          TableName: TABLE_NAME,
          Item: sampleData
        }).promise();
      }
    } catch (dbError) {
      console.error('DynamoDB error:', dbError);
      // If there's a database error, fall back to sample data
      data = sampleData;
    }
    
    // Return only the id and facts (not the lieIndex)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: data.id,
        facts: data.facts
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
      body: JSON.stringify({ error: 'Failed to retrieve data' })
    };
  }
};