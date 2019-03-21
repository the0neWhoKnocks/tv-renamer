const extensions = ['avi', 'mkv', 'mp4'];
export default (file) => {
  const fileTypeOk = new RegExp(`\\.(?:${ extensions.join('|') })$`).test(file);
  const isSample = new RegExp(`\\.sample\\.(?:${ extensions.join('|') })$`).test(file);
  return fileTypeOk && !isSample;
};