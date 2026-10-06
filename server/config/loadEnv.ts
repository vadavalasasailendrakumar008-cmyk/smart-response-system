import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority order for Backend environment configuration:
// 1. server/.env (relative to server directory)
// 2. server/.env (relative to cwd)
// 3. .env.backend (in cwd)
// 4. .env (cwd fallback)
const candidatePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env.backend'),
  path.resolve(process.cwd(), '.env'),
];

let loadedPath: string | null = null;
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedPath = envPath;
    break;
  }
}

if (!loadedPath) {
  dotenv.config();
}

export const activeBackendEnvPath = loadedPath;
