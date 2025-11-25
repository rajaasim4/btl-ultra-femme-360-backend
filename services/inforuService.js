const axios = require('axios');

const initializeInforu = () => {
  const username = process.env.INFORU_USERNAME;
  const apiToken = process.env.INFORU_API_TOKEN;
  const senderName = process.env.INFORU_SENDER_NAME;

  if (!username || !apiToken || !senderName) {
    throw new Error(
      'Inforu credentials missing. Please set INFORU_USERNAME, INFORU_API_TOKEN, and INFORU_SENDER_NAME in your .env file'
    );
  }

  return {
    username,
    apiToken,
    senderName,
  };
};

const createAuthHeader = (username, apiToken) => {
  const credentials = `${username}:${apiToken}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
};

const sendSMS = async (credentials, to, message) => {
  try {
    const apiUrl = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

    const payload = {
      Data: {
        Message: message,
        Recipients: [
          {
            Phone: to,
          },
        ],
        Settings: {
          Sender: credentials.senderName,
        },
      },
    };

    const authHeader = createAuthHeader(
      credentials.username,
      credentials.apiToken
    );

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      timeout: 30000,
    });

    if (response.status === 200 || response.status === 201) {
      console.log('SMS sent successfully to', to);
      return response.data;
    } else {
      const errorMsg =
        response.data?.Message ||
        response.data?.message ||
        'Failed to send SMS';
      throw new Error(errorMsg);
    }
  } catch (error) {
    if (error.response) {
      const errorMsg =
        error.response.data?.Message ||
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.statusText ||
        'Failed to send SMS';
      console.error('Inforu API Error:', errorMsg);
      throw new Error(errorMsg);
    } else if (error.request) {
      console.error('Inforu API: No response received', error.code || '');
      throw new Error('Failed to connect to Inforu API');
    } else {
      console.error('Inforu Error:', error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
};

module.exports = {
  initializeInforu,
  sendSMS,
};
