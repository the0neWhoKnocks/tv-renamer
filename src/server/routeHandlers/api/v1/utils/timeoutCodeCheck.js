export default (err) => (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT');