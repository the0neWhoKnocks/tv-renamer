const cmd = (cmd, { cwd, onError, silent = true, tty } = {}) => new Promise((resolve, reject) => {
  const { spawn } = require('child_process');
  const opts = {
    cwd,
    stdio: tty ? 'inherit' : undefined,
  };
  const child = spawn('sh', ['-c', cmd], opts);
  let stdout = '';
  let stderr = '';
  
  if (!tty) {
    child.stdout.on('data', (data) => {
      const out = data.toString();
      if (!silent) process.stdout.write(out);
      stdout += out;
    });
    
    child.stderr.on('data', (data) => {
      const err = data.toString();
      if (!silent) process.stdout.write(err);
      stderr += err;
    });
  }
  
  child.on('close', async (statusCode) => {
    if (statusCode === 0) resolve(
      stdout
        .split('\n')
        .filter(line => !!line.trim())
        .join('\n')
    );
    else {
      if (onError) {
        if (onError.constructor.name === 'AsyncFunction') await onError(stderr);
        else onError(stderr);
      }
      reject(new Error(`Command "${ cmd }" failed\n${ stderr }`));
    }
  });
});

export default cmd;
