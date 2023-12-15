# Possum

## Introduction
`Possum` is a TypeScript library designed to enhance the reliability of HTTP requests in web applications. It automatically retries failed HTTP requests by leveraging local storage and web workers. This ensures that even if a user goes offline or encounters an error, their requests are stored and retried upon re-establishing a connection or reloading the page.

## Features
- **Automatic Retry**: Failed requests are retried automatically.
- **Local Storage**: Requests are stored locally in case of failure.
- **Web Workers**: Requests are retried in a separate thread to maintain UI responsiveness.
- **Configurable**: Easy to configure for different use cases.

## Installation
```bash
npm install possum
```

Or using yarn:

```bash
yarn add possum
```

## Usage
First, import and initialize `Possum` in your application.

```typescript
import { performPossumRequest } from 'possum';
```

### Making Requests

Use `performPossumRequest` to handle your HTTP requests:

```typescript
import { performPossumRequest } from 'possum';

const requestData = {
    url: 'https://example.com/data',
    method: 'GET'
};

performPossumRequest(requestData)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### Customization

```typescript
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any,
  headers: any;
```

## API Reference
- `performPossumRequest(request: Request): Promise<any>`
- `processFailedRequestsOnLoad(): void`

## Contributing
Contributions are always welcome!
If you have new features to introduce or bugs to squash, kindly submit a [Pull Request (PR)](https://github.com/FeezyHendrix/possum/pulls) to make your mark. Your participation is highly appreciated.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
