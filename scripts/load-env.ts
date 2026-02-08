/**
 * Load .env.local before any app code. Import this first in scripts.
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
