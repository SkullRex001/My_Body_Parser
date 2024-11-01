
# JSON Body Parser Middleware

This middleware helps process and parse JSON request bodies in an HTTP server. It includes several configurable options to enhance security, manage body size limits, handle compressed data, and validate content before parsing.

## Installation

Install the middleware using npm:

```bash
npm install json-body-parser
```

## Usage

```javascript
const bodyParser = require('json-body-parser');

// Basic usage
app.use(bodyParser.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: (req, res, buf, encoding) => {
        // Custom verification logic (optional)
    }
}));
```

### Options

The following options can be configured to customize the JSON body parsing behavior.

---

### 1. `inflate`
Determines if the JSON Body Parser should decompress incoming data based on the `Content-Encoding` header.

- **Description**: If the server sends compressed data, it indicates this with a `Content-Encoding` header. When `inflate` is set to `true`, the parser decompresses the body before parsing. When set to `false`, it rejects any compressed data.
- **Default**: `true`
- **Documentation**: [Content-Encoding Header - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)

---

### 2. `limit`
Sets the maximum size of the body that the middleware will accept. This is not an HTTP-native feature, but a manual check within the parser to prevent excessively large payloads.

- **Description**: Specifies the maximum allowable body size. If the incoming request body exceeds this size, the middleware rejects the request without parsing it.
- **Default**: `100kb`
- **Library**: This option uses the [bytes](https://www.npmjs.com/package/bytes) library for easy size management.

---

### 3. `reviver`
Allows passing a custom `reviver` function for the `JSON.parse` method to transform the parsed JSON object.

- **Description**: Pass a function to transform JSON data before returning it to the application. This option is a standard JavaScript feature that modifies the parsed object based on the reviver function provided.
- **Default**: `null`
- **Documentation**: 
  - [Reviver parameter in JSON.parse - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter)

---

### 4. `strict`
Ensures only JSON objects are accepted as valid input.

- **Description**: When `strict` is set to `true`, only objects are accepted as the body type. The middleware uses JavaScript's `typeof` method to enforce this.
- **Default**: `true`

---

### 5. `type`
Determines the media type the middleware will parse.

- **Description**: This option can be a string (e.g., `'json'`, `'application/json'`, etc.), an array of strings, or a function. If a string or array, it’s passed to the [type-is](https://www.npmjs.com/package/type-is) library to determine if the request should be parsed. If a function, it’s called as `fn(req)` and will parse the request only if it returns a truthy value.
- **Default**: `'application/json'`

---

### 6. `verify`
A custom function that runs before the data is parsed, enabling additional validation on the raw data.

- **Description**: The `verify` function receives four arguments: `req`, `res`, `buf`, and `encoding`. You can use this to verify the raw buffer size, check for an empty body, or add any custom logic. If an error is thrown in this function, the request is rejected.
- **Default**: `null`
- **Example**:

```javascript
// Middleware with verification example
app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
        if (buf.length === 0) {
            throw new Error('Request body cannot be empty');
        }
        
        if (buf.length > 1 * 1024 * 1024) { // 1MB limit
            throw new Error('Request body is too large');
        }

        console.log(`Raw body (encoding: ${encoding}):`, buf.toString(encoding));
    }
}));
```

---

## Example Configuration

```javascript
app.use(bodyParser.json({
    inflate: true,
    limit: '200kb',
    reviver: (key, value) => {
        if (key === 'password') return undefined; // Remove sensitive data
        return value;
    },
    strict: true,
    type: ['application/json', 'application/vnd.api+json'],
    verify: (req, res, buf) => {
        if (buf.length === 0) throw new Error('Request body cannot be empty');
    }
}));
```

## License
MIT License

This middleware makes JSON parsing in Node.js flexible, configurable, and secure. Enjoy seamless data handling with control over payload sizes, data compression, and input validation.
