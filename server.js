const http = require('http');
const httpErrors = require('http-errors');
const zlib = require('zlib');
const bytes = require('bytes'); // Import the bytes library for size parsing
const typeIs = require('type-is'); 

const jsonBodyParser = (request, response, callback, inflate = true, maxSize = '100kb', reviver = null, strict = true ,  type = 'application/json' , verify = null) => {

    //type can be string , array of string or function-> but for now i have only implemented string

    let body = {};
    let header = request.headers;
    let contentType = header["content-type"] ? header["content-type"].toLowerCase() : '';

     // Check if the request has a body
     if (!typeIs.hasBody(request)) {
        return callback(); // No body to process
    }

    if (!typeIs(request, [type])) {
        response.end(JSON.stringify({}));
        throw new httpErrors(500, "Invalid Header");
    }

    let data = [];
    let totalBytes = 0; // Track the total bytes received

    request.on("data", (chunk) => {
        totalBytes += chunk.length; // Increment total bytes

        // Check if the total bytes exceed the maximum size
        const maxSizeInBytes = bytes(maxSize); // Convert maxSize to bytes
        if (totalBytes > maxSizeInBytes) {
            response.statusCode = 413; // Payload Too Large
            response.end(JSON.stringify({ error: 'Request body too large' }));
            request.destroy(); // Destroy the request stream
            return;
        }

        data.push(chunk);
    });

    request.on("end", () => {
        try {
            let rawData = Buffer.concat(data);

            if (verify) {
                verify(request, response, rawData, request.headers['content-encoding'] || 'utf-8');
            }

            // Check for deflate (compressed) data
            if (inflate && request.headers['content-encoding'] === 'deflate') {
                // Inflate the compressed data
                rawData = zlib.inflateSync(rawData);
            } else if (!inflate && request.headers['content-encoding'] === 'deflate') {
                response.statusCode = 415; // Unsupported Media Type
                response.end(JSON.stringify({ error: 'Deflated bodies are rejected' }));
                return;
            }

            // Parse the JSON data with reviver if provided
            const parsedData = JSON.parse(rawData.toString("utf-8"), reviver);

            // Check for strict mode: only allow arrays or objects
            if (strict && typeof parsedData !== 'object') {
                response.statusCode = 400; // Bad Request
                response.end(JSON.stringify({ error: 'Only JSON objects or arrays are allowed' }));
                return;
            }

            body = parsedData;
            request.body = body;

            // Call the callback to continue processing the request
            callback();
        } catch (error) {
            response.statusCode = 400; // Bad Request
            response.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
};

const server = http.createServer((request, response) => {
    // Example reviver function: Convert date strings to Date objects
    const reviver = (key, value) => {
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            return new Date(value);
        }
        return value;
    };

    jsonBodyParser(request, response, () => {
        console.log("---Header-----");
        console.log(request.headers["content-type"]);

        console.log("---URL-----");
        console.log(request.url);
        console.log("---METHOD-----");
        console.log(request.method);
        console.log("---BODY-----");
        console.log(request.body); // Now this will have the parsed body

        response.setHeader('content-type', "application/json");
        response.end(JSON.stringify({
            message: "Aditya Vikram Singh"
        }));
    }, true, '100kb', reviver, true); // Pass the strict mode to jsonBodyParser
});

// Start the server
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
