import fs from 'fs';

export function log(msg: unknown) {
  const timestamp = new Date().toLocaleString();
  const formattedMsg = `${timestamp}, ${msg}`;
  console.log(msg);
  fs.appendFileSync('log.txt', `${formattedMsg}\n`);
}
