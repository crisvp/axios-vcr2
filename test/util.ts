import { join } from "path";

export function fixtureFile(fileName: string) {
  return join(__dirname, "fixtures", fileName);
}
