export default (timestamp) => 
  Math.floor(24 - ((Date.now() - timestamp) / 36e5));