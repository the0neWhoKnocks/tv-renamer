
export default (name) => {
  return name
    // Linux
    .replace(/\//g, '-')
    // Windows
    .replace(/[:|]/g, '-')
    .replace(/[<]/g, '(less-than)')
    .replace(/[>]/g, '(greater-than)')
    .replace(/["]/g, '\'')
    .replace(/[\\?*]/g, '');
};