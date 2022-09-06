import { describe, test, expect } from "@jest/globals";
import { defaultMatcher, simpleMatcher } from "../src/lib/Matchers";
import {
  axiosRequestConfig,
  axiosRandomTransformer,
  axiosStaticTransformer,
} from "./fixtures/axiosFixtures";

describe("Matchers", () => {
  describe("simpleMatcher", () => {
    test("produces consistent output based on config", () => {
      const resultOne = simpleMatcher(axiosRequestConfig);
      const resultTwo = simpleMatcher(axiosRequestConfig);
      expect(resultOne).toEqual(resultTwo);
    });

    test("does not use query parameters", () => {
      const resultOne = simpleMatcher({
        ...axiosRequestConfig,
        data: { test: "jest" },
      });
      const resultTwo = simpleMatcher({
        ...axiosRequestConfig,
        data: { test: "not jest" },
      });
      expect(resultOne).toEqual(resultTwo);
    });

    test("does not use POST body", () => {
      const resultOne = simpleMatcher({
        ...axiosRequestConfig,
        method: "POST",
        data: { test: "jest" },
      });
      const resultTwo = simpleMatcher({
        ...axiosRequestConfig,
        method: "POST",
        data: { test: "not jest" },
      });
      expect(resultOne).toEqual(resultTwo);
    });

    test("uses baseURL", () => {
      const baseUrlConfig = {
        ...axiosRequestConfig,
        url: "/someurl",
        baseURL: "http://www.example.com/",
      };

      const noBaseUrlConfig = {
        ...axiosRequestConfig,
        url: "http://www.example.com/someurl",
      };

      const resultOne = simpleMatcher(baseUrlConfig);
      const resultTwo = simpleMatcher(noBaseUrlConfig);
      expect(resultOne).toEqual(resultTwo);
    });
  });

  describe("defaultMatcher", () => {
    test("produces consistent output based on config", () => {
      const resultOne = defaultMatcher(axiosRequestConfig);
      const resultTwo = defaultMatcher(axiosRequestConfig);
      expect(resultOne).toEqual(resultTwo);

      const otherConfig = {
        ...axiosRequestConfig,
        headers: { Authorization: "Bearer jest" },
      };
      const resultThree = defaultMatcher(otherConfig);
      expect(resultThree).not.toEqual(resultTwo);
    });

    test("applies single axios request transformer", () => {
      const transformConfig = {
        ...axiosRequestConfig,
        transformRequest: axiosRandomTransformer,
      };

      const resultOne = defaultMatcher(transformConfig);
      const resultTwo = defaultMatcher(transformConfig);
      expect(resultOne).not.toEqual(resultTwo);
    });

    test("applies multiple axios request transformers", () => {
      const transformConfigSingle = {
        ...axiosRequestConfig,
        transformRequest: axiosStaticTransformer,
      };
      const transformConfigMultiple = {
        ...axiosRequestConfig,
        transformRequest: [axiosStaticTransformer, axiosStaticTransformer],
      };

      const resultOne = defaultMatcher(transformConfigSingle);
      const resultTwo = defaultMatcher(transformConfigMultiple);
      expect(resultOne).not.toEqual(resultTwo);
    });

    test("uses baseURL", () => {
      const baseUrlConfig = {
        ...axiosRequestConfig,
        url: "/someurl",
        baseURL: "http://www.example.com/",
      };

      const noBaseUrlConfig = {
        ...axiosRequestConfig,
        url: "http://www.example.com/someurl",
      };

      const resultOne = defaultMatcher(baseUrlConfig);
      const resultTwo = defaultMatcher(noBaseUrlConfig);
      expect(resultOne).toEqual(resultTwo);
    });

    test("does use POST body", () => {
      const resultOne = defaultMatcher({
        ...axiosRequestConfig,
        method: "POST",
        data: { test: "jest" },
      });
      const resultTwo = defaultMatcher({
        ...axiosRequestConfig,
        method: "POST",
        data: { test: "not jest" },
      });
      expect(resultOne).not.toEqual(resultTwo);
    });
  });
});
