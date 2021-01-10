import { promises as fs } from 'fs';

const { writeFile } = fs;

export default function saveFile(filePath, data) {
  // NOTE - purposefly not wrapping with try/catch since each case would need to
  // handle an error differently.
  return writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}
