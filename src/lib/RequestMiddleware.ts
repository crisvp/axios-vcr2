import { AxiosError, AxiosRequestConfig } from "axios";
import { Cassette } from "./Cassettes";

import { defaultMatcher, MatcherFunction } from "./Matchers";
import * as jsonDB from "./jsonDb";

import Debug from "./Debug";
import { AxiosFixtureResponse, isAxiosFixture } from "./AxiosFixture";

const debug = Debug(__filename);

async function loadCassette(
  cassettePath: string,
  axiosConfig: AxiosRequestConfig,
  matcher: MatcherFunction
): Promise<Partial<Cassette>> {
  const requestKey = matcher(axiosConfig);
  debug(`looking for ${requestKey} in ${cassettePath}`);
  const cassette = await jsonDB.loadCassette(cassettePath, requestKey);
  if (cassette.fixture)
    debug(`found cassette ${requestKey} in ${cassettePath}`);
  else debug(`did not find cassette ${requestKey} in ${cassettePath}`);
  return cassette;
}

type RequestSuccessInterceptor = (
  axiosConfig: AxiosRequestConfig
) => Promise<AxiosRequestConfig<unknown>>;

export function success(
  cassettePath: string,
  matcher: MatcherFunction = defaultMatcher
): RequestSuccessInterceptor {
  return async (axiosConfig: AxiosRequestConfig) => {
    debug(
      "running successs intercepter for %s %s - %s",
      axiosConfig.method,
      axiosConfig.url,
      cassettePath
    );
    const cassette = await loadCassette(cassettePath, axiosConfig, matcher);
    if (isAxiosFixture(cassette)) {
      debug("cassette found, setting up VCR adapter");
      axiosConfig.adapter = async (_axiosConfig: AxiosRequestConfig) => {
        return {
          _fixture: true,
          ...cassette.originalResponseData,
        } as AxiosFixtureResponse;
      };
    } else {
      debug("cassette not found, setting up node http adapter");
      // By default axios uses XHR and so CORS fails. Switch to the node adapter.
      axiosConfig.adapter = require("axios/lib/adapters/http");
    }
    return axiosConfig;
  };
}

export const failure = (error: AxiosError) => error;
