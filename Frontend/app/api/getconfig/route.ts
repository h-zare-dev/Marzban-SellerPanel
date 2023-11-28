import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      jsonDirectory + "/config.json",
      "utf8"
    );
    return new Response(fileContents);
  } catch (Error) {
    return new Response(null);
  }
}
