/**
 * Manually run markGoneSourceUrls to test 404/410 detection and DB updates.
 *
 * Usage:
 *   npx tsx scripts/mark-gone-source-urls.ts [--limit N]
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL; SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 */

import { config } from "dotenv";
import path from "path";
import { markGoneSourceUrls } from "../src/lib/mark-gone-source-urls";

const projectRoot = path.resolve(__dirname, "..");
config({ path: path.join(projectRoot, ".env") });
config({ path: path.join(projectRoot, ".env.local") });

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1] ?? "30", 10) : undefined;

async function main() {
  console.log("Running markGoneSourceUrls...");
  const result = await markGoneSourceUrls({ limit });
  console.log("Result:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
