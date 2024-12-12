import fs from 'fs';

export type Config = {
  db: {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string
  }
}

export const config = JSON.parse(fs.readFileSync('config.json', 'utf-8')) as Config;
