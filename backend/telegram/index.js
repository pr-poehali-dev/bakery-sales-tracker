/**
 * Business: Send sales report to Telegram
 * Args: event with httpMethod, body containing botToken, chatId, reportText
 * Returns: HTTP response with success/error status
 */

exports.handler = async (event, context) => {
  const { httpMethod } = event;

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      isBase64Encoded: false,
      body: ''
    };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: false,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const bodyData = JSON.parse(event.body || '{}');
    const { botToken, chatId, reportText } = bodyData;

    if (!botToken || !chatId || !reportText) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        isBase64Encoded: false,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: reportText,
        parse_mode: 'MarkdownV2'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        isBase64Encoded: false,
        body: JSON.stringify({ 
          error: 'Telegram API error', 
          details: result 
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: false,
      body: JSON.stringify({ 
        success: true,
        message: 'Report sent successfully' 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: false,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
};
