const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middlewares setup
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello')
})

app.listen(port, () => {
  console.log(`service site server running on port ${port}`);
})