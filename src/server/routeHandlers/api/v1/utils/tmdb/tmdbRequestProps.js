export default ({ apiKey, params }) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  return {
    headers,
    qs: {
      ...params,
      api_key: apiKey,
      language: 'en-US',
    },
    timeout: 3000, // 3 seconds
  };  
};