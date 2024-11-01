const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/avs', (req, res) => {
  // Log headers
  console.log('Headers:', req.headers);

  // Log body
  console.log('Body:', req.body);

  // Send a response
  res.json({ message: 'Received' });
});

// Start the server
app.listen(3002, () => {
  console.log('Server is listening on port 3000');
});
