export default (name, forFolder=false) => {
  let newName = name;
  
  if (forFolder) newName = newName.replace(/\.$/, ''); // folders can't end in a dot
  
  return newName
    // Linux
    .replace(/\//g, '-')
    // Windows
    .replace(/[:|–]/g, '-')
    .replace(/[<]/g, '(less-than)')
    .replace(/[>]/g, '(greater-than)')
    .replace(/[`’"“”]/g, '\'')
    .replace(/[\\?*]/g, '');
};