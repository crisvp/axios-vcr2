import { AxiosResponse, Method } from "axios";
import { Cassette } from "./Cassettes";

import { AxiosFixtureResponse, isAxiosFixtureResponse } from "./AxiosFixture";
import { defaultMatcher, MatcherFunction } from "./Matchers";
import * as jsonDB from "./jsonDb";
import Debug from "./Debug";

const debug = Debug(__filename);

function serialize(response: AxiosResponse): Partial<Cassette> {
  const meta = {
    url: response.config.url,
    method: response.config.method as Method,
    data: response.config.data,
    headers: response.config.headers,
  };

  return {
    meta,
    fixture: true,

    originalResponseData: {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: meta,
    },
  };
}

async function storeFixture(
  cassettePath: string,
  requestKey: string,
  response: AxiosResponse
) {
  if ((await jsonDB.loadCassette(cassettePath, requestKey)).fixture) {
    debug(`found cassette id ${requestKey} in ${cassettePath} - not writing`);
  } else {
    debug(`storing new cassette id ${requestKey} to ${cassettePath}`);
    const fixture = serialize(response);
    await jsonDB.writeCassette(cassettePath, requestKey, fixture);
  }
}

export function success(
  cassettePath: string,
  matcher: MatcherFunction = defaultMatcher
): (res: AxiosFixtureResponse | AxiosResponse) => Promise<AxiosResponse> {
  return async function (
    res: AxiosFixtureResponse | AxiosResponse
  ): Promise<AxiosResponse> {
    if (isAxiosFixtureResponse(res)) {
      debug("response success interceptor returning saved response");
      delete res._fixture;
      return res;
    }

    const id = matcher(res.config);
    if (id) await storeFixture(cassettePath, id, res);

    return res;
  };
}

export const failure = (error: unknown) => error;
