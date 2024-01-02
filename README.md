# Possum

## Table of content

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Making Requests](#making-requests)
    - [Customization](#customization)
    - [Configuring Storage](#configuring-storage)
- [Api Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Introduction

`Possum` is a TypeScript library designed to enhance the reliability of HTTP requests in web applications. It
automatically retries failed HTTP requests by leveraging local storage and web workers. This ensures that even if a user
goes offline or encounters an error, their requests are stored and retried upon re-establishing a connection or
reloading the page.

## Features

- **Automatic Retry**: Failed requests are retried automatically.
- **Local Storage**: Requests are stored locally in case of failure.
- **Web Workers**: Requests are retried in a separate thread to maintain UI responsiveness.
- **Configurable**: Easy to configure for different use cases.

## Installation

```bash
npm install possum-client
```

Or using yarn:

```bash
yarn add possum-client
```

## Usage

First, import and initialize `Possum` in your application.

```typescript
import {performPossumRequest} from 'possum-client';
```

### Making Requests

Use `performPossumRequest` to handle your HTTP requests:

```typescript
import {PossumClient} from "possum-client";

const {performPossumRequest} = PossumClient();


const requestData = {
    url: 'https://example.com/data',
    method: 'GET'
};

performPossumRequest(requestData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### Customization

#### PossumRequest

```typescript
interface PossumeRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any,
    headers: any;
}
```

#### PossumClientOptions

```typescript
interface PossumClientOptions {
    /**
     * Options to define the storage possum would use to store failed requests.
     */
    store?: PossumStoreConfigOptions;
    /**
     * If true possum would attach an event listener to process stored failed requests on `DOMContentLoaded`.
     * This option only works while on the browser
     */
    retryOnPageLoad?: boolean;
}
```

#### Configuring Storage

```typescript
import {PossumClient} from "possum-client";
import {createClient} from 'redis';


const redisClient = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

// configuring possum to use redis to store failed requests
const {performPossumRequest} = PossumClient({
    store: {
        get: async (id) => {
            const data = await redisClient.get(id);
            return data ? JSON.parse(data) : null;
        },
        set: async (id, data) => {
            await redisClient.set(id, JSON.stringify(data))
        }
    }
});

const requestData = {
    url: 'https://example.com/data',
    method: 'GET'
};

performPossumRequest(requestData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

## API Reference

- `performPossumRequest(request: Request): Promise<any>`
- `processFailedRequestsOnLoad(): void`
- `PossumClient(options?: PossumClientOptions): { performPossumRequest, processFailedRequestsOnLoad }`

## Contributing

Contributions are always welcome!
If you have new features to introduce or bugs to squash, kindly submit
a [Pull Request (PR)](https://github.com/FeezyHendrix/possum/pulls) to make your mark. Your participation is highly
appreciated.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
