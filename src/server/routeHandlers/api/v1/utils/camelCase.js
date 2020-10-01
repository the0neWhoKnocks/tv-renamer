const camelCase = (str) => str.toLocaleLowerCase().replace(/\s+(\w)?/gi, (m, l) => l.toUpperCase());

export default camelCase;
