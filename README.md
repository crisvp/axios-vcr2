# axios-vcr2

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

## About The Project

This is a library intended to mock HTTP responses in node - specifically [jest](https://github.com/facebook/jest) or similar testing frameworks.

It is intended to be easy to use: mount a cassette, record a session, and play it back on subsequent requests, recording only exactly what you want and need without hooking into the global node libraries.

If you are looking for something more powerful, try [nock](https://github.com/nock/nock) instead.

This is primarily a TypeScript rewrite of [axios-vcr](https://github.com/nettofarah/axios-vcr), addressing some small bugs and adding the ability to use custom Axios instances.

## Getting Started

### Prerequisites

You will need a package manager of your choice, and you will probably want to use this in some testing framework.
There is no dependency on any specific framework - you can use this package in any node environment.

* yarn

  ```sh
  npm install yarn@latest -g
  ```

* axios

  ```sh  
  yarn add axios@latest
  ```

### Installation

* axios-vcr2

  ```sh
  yarn add -D axios-vcr2
  ```

## Usage

### Basic usage

```TypeScript
  import axios from "axios";
  import { mountCassette, ejectCassette } from "axios-vcr2";

  mountCassette("myCassettes.json");
  // Record the request the first time this line runs
  // Next time you run this file, the request will be played back.
  axios.get("http://www.example.com/");

  // After ejecting the cassette, requests will not be recorded.
  ejectCassette("myCassettes.json");
  
  axios.get("http://www.example.com/"); // <- not recorded/played back
```

### Advanced usage

It is possible to use custom axios instances, use more than one cassette, and/or to specify custom matchers.

```TypeScript
  import axios, { AxiosRequestConfig } from "axios";
  import { mountCassette, ejectCassette } from "axios-vcr2";

  const myAxios = axios.create();

  // This matcher looks at the method and URL. This is very similar to
  // the `defaultMatcher` included with this package.
  function exampleMatcher(requestConfig: AxiosRequestConfig): string {
    const { baseURL, method } = config;
    const url = config.baseURL ? new URL(url, config.baseURL).toString() : config.url;

    // This can be any string. It will be used as the cassette id, to match subsequent
    // requests. The matchers included with this package use md5 to hash a processed object.
    // Return 'null' not to save the request in this file.
    return url.includes("example.com") ? `${method}:${url}` : null;
  }

  // Returns a random id to record all other requests
  function jeevesMatcher(requestConfig: AxiosRequestConfig): string {
    const { baseURL, method } = config;
    const url = config.baseURL ? new URL(url, config.baseURL).toString() : config.url;
    return url.includes("askjeeves.com") ? `${method}:${url}` : null;
  }

  mountCassette("example.com.json", myAxios, exampleMatcher);
  mountCassette("askjeeves.com.json", myAxios, jeevesMatcher);

  // Two files will be created; example.com.json containing 2 requests to example.com,
  // and askjeeves.com.json containing 1 request to askjeeves.com
  myAxios.get("http://www.example.com/");
  myAxios.post("http://www.example.com/", { a: 1 }); 
  myAxios.get("http://www.askjeeves.com/");
```

## Development

### testing

```sh
yarn test
```

### Debugging

This package uses [debug](https://github.com/debug-js/debug). To enable debugging, set the environment variable
`DEBUG` to `axios-vcr2:*`:

```sh
DEBUG="axios-vcr2:*" yarn test
```

### Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Cris van Pelt - cris@melkfl.es

Project Link: [https://github.com/crisvp/axios-vcr2](https://github.com/crisvp/axios-vcr2)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/crisvp/axios-vcr2.svg?style=for-the-badge
[contributors-url]: https://github.com/crisvp/axios-vcr2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/crisvp/axios-vcr2.svg?style=for-the-badge
[forks-url]: https://github.com/crisvp/axios-vcr2/network/members
[stars-shield]: https://img.shields.io/github/stars/crisvp/axios-vcr2.svg?style=for-the-badge
[stars-url]: https://github.com/crisvp/axios-vcr2/stargazers
[issues-shield]: https://img.shields.io/github/issues/crisvp/axios-vcr2.svg?style=for-the-badge
[issues-url]: https://github.com/crisvp/axios-vcr2/issues
[license-shield]: https://img.shields.io/github/license/crisvp/axios-vcr2.svg?style=for-the-badge
[license-url]: https://github.com/crisvp/axios-vcr2/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/crisvanpelt
