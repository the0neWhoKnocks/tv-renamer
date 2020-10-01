export default (err) => {
  if(!err) err = {}; // since `null` is an Object, can't set default
  return (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT');
};