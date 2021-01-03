const pad = (num, token='00') => token.substring(0, token.length-`${ num }`.length) + num;
export default pad;
