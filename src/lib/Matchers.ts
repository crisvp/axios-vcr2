import {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  HeadersDefaults,
  Method,
} from "axios";
import md5 from "md5";
import Debug from "./Debug";

const debug = Debug(__filename);

const indexableHeaders = [
  "authorization",
  "proxy-authenticate",
  "proxy-authorization",
  "accept",
  "accept-language",
  "accept-encoding",
  "expect",
  "vary",
];

type Header = [string, string | number | boolean];
type IndexableHeaders = Partial<
  Pick<AxiosRequestHeaders, typeof indexableHeaders[number]>
>;

const axiosMethods = [
  "common",
  "delete",
  "get",
  "head",
  "post",
  "put",
  "patch",
  "options",
  "purge",
  "link",
  "unlink",
];

export type MatcherFunction = (args: AxiosRequestConfig) => string | null;

/**
 * Transforms an AxiosRequestConfig object into a string.
 *
 * This method bases the digest on URL + method only.
 * @date 9/2/2022 - 1:53:55 PM
 *
 * @export
 * @param {AxiosRequestConfig} config Axios request configuration
 * @returns {string} A unique hash representing the configuration
 */
export function simpleMatcher(config: AxiosRequestConfig): string | null {
  const { baseURL, method } = config;
  let { url } = config;

  if (baseURL) url = new URL(url, baseURL).toString();
  const digestConfig = {
    url,
    method,
  };

  const digest = md5(JSON.stringify(digestConfig));
  debug(`final configuration used for digest ${digest}: %o`, digestConfig);
  return digest;
}

/**
 * Transforms an AxiosRequestConfig object into a string.
 *
 * This method bases the digest on URL + method + authentication +
 * request body or request parameters.
 * @date 9/2/2022 - 1:53:55 PM
 *
 * @export
 * @param {AxiosRequestConfig} config Axios request configuration
 * @returns {string} A unique hash representing the configuration
 */
export function defaultMatcher(config: AxiosRequestConfig): string | null {
  const { baseURL, method, data, transformRequest } = config;
  let { headers, url } = config;

  if (baseURL) url = new URL(url, baseURL).toString();

  const digestConfig = {
    url,
    method,
    data: data,
    headers: undefined,
  };

  // Request transformers need to run before header selection, because they can
  // modify headers in-place
  if (typeof transformRequest !== "undefined")
    [headers, digestConfig.data] = applyTransformers(
      transformRequest,
      data,
      headers
    );

  headers = flattenDefaultHeaders(headers, method);
  debug("flattened headers %o", headers);
  const indexHeaders: IndexableHeaders = Object.fromEntries(
    Object.entries(headers)
      .map(([k, v]): Header => [k.toLowerCase(), v])
      .filter(([k]) => indexableHeaders.includes(k))
  );
  digestConfig.headers = normalizeHeaders(indexHeaders);
  debug("sorted %o", headers);

  const digest = md5(JSON.stringify(digestConfig));
  debug(`final configuration used for digest ${digest}: %o`, digestConfig);
  return digest;
}

function applyTransformers<T>(
  transformRequest: AxiosRequestTransformer | AxiosRequestTransformer[],
  data: T,
  headers: AxiosRequestHeaders
): [AxiosRequestHeaders, T] {
  debug("applying transformer on %o, headers %o", data, headers);
  const transformers = Array.isArray(transformRequest)
    ? transformRequest
    : [transformRequest];

  const o = { headers: {} };
  const transformedData = transformers.reduce(
    (nextData: unknown, fn: AxiosRequestTransformer) => fn(nextData, o.headers),
    data
  );
  debug("transformed data %o", transformedData);
  debug("transformed headers %o", headers);
  return [headers, transformedData];
}

function flattenDefaultHeaders(
  headers: HeadersDefaults | AxiosRequestHeaders,
  method: Method | string
): AxiosRequestHeaders {
  if (isHeadersDefaults(headers)) {
    const customHeaders = Object.fromEntries(
      Object.entries(headers).filter(([k]) => !axiosMethods.includes(k))
    );
    return { ...headers.common, ...headers[method], ...customHeaders };
  }

  return headers;
}

function normalizeHeaders(headers: AxiosRequestHeaders): AxiosRequestHeaders {
  return Object.fromEntries(
    Object.keys(lowerCaseObjectKeys(headers))
      .sort()
      .reduce((a, k) => [...a, [k, headers[k]]], [])
  );
}

function lowerCaseObjectKeys<T>(object: T) {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k.toLowerCase(), v])
  );
}

function isHeadersDefaults(v: unknown): v is HeadersDefaults {
  return (
    (v as HeadersDefaults).common !== undefined &&
    (v as HeadersDefaults).put !== undefined
  );
}
