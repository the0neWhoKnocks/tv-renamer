export default () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  return {
    headers,
    json: true,
    timeout: 3000, // 3 seconds
  };  
};