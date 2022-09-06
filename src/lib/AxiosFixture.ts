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

export function isAxiosFixture(v: unknown): v is AxiosFixture {
  return (v as AxiosFixture).fixture === true;
}
