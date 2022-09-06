import fs from "fs";
import util from "util";
import { Cassettes } from "./Cassettes";

const writeFile = util.promisify(fs.writeFile);

export const readCassettes = async (
  filePath: fs.PathLike
): Promise<Cassettes> => {
  try {
    const data = await util.promisify(fs.readFile)(filePath, {
      encoding: "utf8",
    });
    const p = JSON.parse(data);
    return p;
  } catch {
    return {};
  }
};

export const writeCassettes = async (filePath: string, cassettes: Cassettes) =>
  await writeFile(filePath, JSON.stringify(cassettes, null, 2));
