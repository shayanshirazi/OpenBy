/**
 * Test Google Custom Search image API. Run: npx tsx scripts/test-google-images.ts
 * Prints full API response so you can see why images might fail.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const apiKey = process.env.GOOGLE_CSE_API_KEY;
const cx = process.env.GOOGLE_CSE_CX;

if (!apiKey) {
  console.error("Missing GOOGLE_CSE_API_KEY in .env.local");
  process.exit(1);
}
if (!cx) {
  console.error("Missing GOOGLE_CSE_CX in .env.local");
  process.exit(1);
}

const query = "Sony WH-1000XM5 headphones";
const params = new URLSearchParams({
  key: apiKey,
  cx,
  q: query,
  searchType: "image",
  num: "3",
  safe: "active",
  imgType: "photo",
  imgSize: "large",
});
const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

console.log("Requesting:", url.replace(apiKey, "***"));
const res = await fetch(url);
const data = await res.json();

console.log("\nStatus:", res.status, res.statusText);
console.log("\nFull response:");
console.log(JSON.stringify(data, null, 2));

if (data.error) {
  console.error("\n>>> API ERROR:", data.error.message);
  console.error(">>> Fix: Enable Image search at programmablesearchengine.google.com → Edit your engine → Search features → Image search ON");
  console.error(">>> Also ensure the CSE searches 'the entire web', not just specific sites.");
}
if (data.items?.[0]) {
  const item = data.items[0];
  const imgUrl = item.link ?? item.pagemap?.cse_image?.[0]?.src ?? item.image?.thumbnailLink;
  console.log("\n>>> Image URL found:", imgUrl ?? "(none)");
}
