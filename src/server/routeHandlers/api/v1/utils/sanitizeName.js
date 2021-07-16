import logger from 'SERVER/utils/logger';

const log = logger('server:sanitizeName');

export default (name, forFolder=false) => {
  try {
    let newName = name;
    
    if (forFolder) newName = newName.replace(/\.$/, ''); // folders can't end in a dot
    
    // Rough curse word replacement. Combinations of some characters can cause
    // havok with CLI commands.
    const maskedCurseWord = '([\\W&]{4})';
    const maskedRegEx = new RegExp(`(?:^${ maskedCurseWord }\\s|\\s${ maskedCurseWord }\\s|\\s${ maskedCurseWord }$)`, 'g');
    newName = newName.replace(maskedRegEx, (group) => {
      return group.split('').map(char => (char === ' ') ? ' ' : '-').join('');
    });
    
    return newName
      // Linux
      .replace(/\//g, '-')
      // Windows
      .replace(/[:|–*]/g, '-')
      .replace(/[<]/g, '(less-than)')
      .replace(/[>]/g, '(greater-than)')
      .replace(/[`’"“”]/g, '\'')
      .replace(/[\\?]/g, '');
  }
  catch (err) {
    log.error(err);
    throw err;
  }
};