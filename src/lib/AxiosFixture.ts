import { AxiosRequestHeaders, AxiosResponse, Method } from "axios";

export interface AxiosFixture {
  meta: {
    url: string;
    method: Method;
    data: string | number | boolean;
    headers: AxiosRequestHeaders;
  };
  fixture: boolean;
  originalResponseData: AxiosResponse;
}

export interface AxiosFixtureResponse extends AxiosResponse {
  _fixture: boolean;
}

export function isAxiosFixture(v: unknown): v is AxiosFixture {
  return (v as AxiosFixture).fixture === true;
}

export function isAxiosFixtureResponse(v: unknown): v is AxiosFixtureResponse {
  return (v as AxiosFixtureResponse)._fixture === true;
}
