import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const initDir = path.resolve(__dirname, '../../db/init');

async function main() {
  const files = (await fs.readdir(initDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(initDir, file), 'utf8');
    await pool.query(sql);
    console.log(`applied ${file}`);
  }
  console.log('geo_spatial database schema is ready');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
