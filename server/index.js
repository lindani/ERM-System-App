// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock risk data
const risks = [
  { id: 1, name: "Data Breach", score: 8 },
  { id: 2, name: "Supply Chain Disruption", score: 6 },
];

// API Routes
app.get('/api/risks', (req, res) => {
  res.json(risks);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});