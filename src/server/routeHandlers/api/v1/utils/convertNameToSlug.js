export default (name) => name
  .toLowerCase()
  .replace(/\s/g, '-')
  .replace(/'|:|\(|\)/g, '');