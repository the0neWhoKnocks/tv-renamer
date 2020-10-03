const camelCase = (str) => str
  .toLocaleLowerCase()
  // kill any non alpha-numeric chars (but leave spaces)
  .replace(/[^a-zA-Z0-9 ]/g, '')
  // capitalize any words with a leading space (and remove the space)
  .replace(/\s+(\w)?/gi, (m, l) => l.toUpperCase());

export default camelCase;
