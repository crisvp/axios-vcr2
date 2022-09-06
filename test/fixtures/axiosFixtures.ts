import {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  AxiosResponse,
  AxiosResponseHeaders,
} from "axios";
import { AxiosFixture } from "../../src/lib/AxiosFixture";

export const axiosResponseHeaders: AxiosResponseHeaders = {
  age: "560374",
  "cache-control": "max-age=604800",
  "content-type": "text/html; charset=UTF-8",
  date: "Fri, 02 Sep 2022 12:10:03 GMT",
  etag: '"3147526947+gzip+ident"',
  expires: "Fri, 09 Sep 2022 12:10:03 GMT",
  "last-modified": "Thu, 17 Oct 2019 07:18:26 GMT",
  server: "ECS (chb/0286)",
  vary: "Accept-Encoding",
  "x-cache": "HIT",
  "content-length": "1256",
  connection: "close",
};

export const axiosRequestHeaders: AxiosRequestHeaders = {
  Authorization: "Bearer xyz",
  Accept: "application/json, text/plain, */*",
};

export const axiosRequestConfig: AxiosRequestConfig = {
  url: "http://www.example.com/",
  method: "get",
  timeout: 5000,
  headers: axiosRequestHeaders,
};

export const axiosResponseConfig: AxiosRequestConfig = {
  url: "http://www.example.com/",
  method: "get",
  headers: axiosRequestHeaders,
};

export const axiosResponse: AxiosResponse = {
  data: "test data",
  status: 200,
  statusText: "",
  config: axiosResponseConfig,
  headers: axiosResponseHeaders,
};

export const axiosFixture: AxiosFixture = {
  meta: {
    url: "http://www.example.com/",
    method: "get",
    data: "",
    headers: axiosRequestHeaders,
  },
  fixture: true,
  originalResponseData: axiosResponse,
};

export const axiosRandomTransformer: AxiosRequestTransformer = (
  data: unknown,
  _headers?: AxiosRequestHeaders
): string => {
  return `transformed data - ${Math.random()} - ${data}`;
};

export const axiosStaticTransformer: AxiosRequestTransformer = (
  data: unknown,
  _headers?: AxiosRequestHeaders
): string => {
  return `transformed data ${data}`;
};
