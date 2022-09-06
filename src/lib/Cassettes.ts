import axios, { AxiosInstance } from "axios";
import * as RequestMiddleware from "./RequestMiddleware";
import * as ResponseMiddleware from "./ResponseMiddleware";
import { defaultMatcher, MatcherFunction } from "./Matchers";
import { AxiosFixture } from "./AxiosFixture";

import Debug from "./Debug";
const debug = Debug(__filename);

export interface Cassettes {
  [index: string]: Partial<Cassette>;
}

export type Cassette = AxiosFixture;

export interface Recorder {
  responseInterceptor: number;
  requestInterceptor: number;
  axios: AxiosInstance;
}

export interface Recorders {
  [index: string]: Recorder;
}

export const recorders: Recorders = {};

/**
 * Mounts a cassette file on the Axios instance provided, or the default instance.
 * It is possible to attach more than one cassette file.
 * @date 9/2/2022 - 1:49:03 PM
 *
 * @param {string} cassettePath JSON file containing the cassettes with recorded session. Will be created if it does not exist.
 * @param {AxiosInstance} [client=axios] An AxiosInstance object; will default to the global axios object.
 * @param {MatcherFunction} [matcher=defaultMatcher] A custom matcher. Supplied matchers are 'defaultMatcher' and 'simpleMatcher'.
 */
export function mountCassette(
  cassettePath: string,
  client: AxiosInstance = axios,
  matcher: MatcherFunction = defaultMatcher
): void {
  debug(`mounting cassette ${cassettePath} for %o`, axios);
  const responseInterceptor = client.interceptors.response.use(
    ResponseMiddleware.success(cassettePath, matcher),
    ResponseMiddleware.failure
  );

  const requestInterceptor = client.interceptors.request.use(
    RequestMiddleware.success(cassettePath, matcher),
    RequestMiddleware.failure
  );

  recorders[cassettePath] = {
    responseInterceptor: responseInterceptor,
    requestInterceptor: requestInterceptor,
    axios: client,
  };
}

/**
 * Detach a cassette file from its axios instance. Sessions will no longer be recorded or replayed
 * from that cassette file.
 * @date 9/2/2022 - 1:52:07 PM
 *
 * @param {string} cassettePath
 */
export function ejectCassette(cassettePath: string): void {
  const interceptors = recorders[cassettePath];
  const axios = interceptors.axios;
  debug(`ejecting cassette ${cassettePath}: %o`, interceptors);

  axios.interceptors.response.eject(interceptors.responseInterceptor);
  axios.interceptors.request.eject(interceptors.requestInterceptor);
}
