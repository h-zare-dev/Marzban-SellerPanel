import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filepath = path.join(process.cwd(), "data", "config.json");
    const fileContents = await fs.readFile(filepath, "utf8");
    return new Response(fileContents);
  } catch (Error) {
    return new Response(null);
  }
}
