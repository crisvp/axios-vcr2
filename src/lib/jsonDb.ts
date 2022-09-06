import { dirname as getDirName } from "path";

import mkdirp from "mkdirp";

import { readCassettes, writeCassettes } from "./readWriteCassettes";
import { Cassette, Cassettes } from "./Cassettes";

const loadAllCassettes = async (filePath: string): Promise<Cassettes> =>
  readCassettes(filePath);

export async function loadCassette(
  filePath: string,
  key: string
): Promise<Partial<Cassette>> {
  const cassettes: Cassettes = await loadAllCassettes(filePath);
  return cassettes[key] || {};
}

export async function writeCassette(
  filePath: string,
  key: string,
  cassette: Partial<Cassette>
): Promise<void> {
  mkdirp.sync(getDirName(filePath));

  const cassettes = await loadAllCassettes(filePath);
  cassettes[key] = cassette;

  return await writeCassettes(filePath, cassettes);
}
