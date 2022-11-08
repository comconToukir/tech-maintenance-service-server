const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { cloudinary } = require('./utils/cloudinary.utils');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n9sry.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(
  uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

// middlewares setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }))


app.get('/', (req, res) => {
  res.send('hello')
})

const run = async () => {
  try {
    const techMaintenance = client.db("techMaintenance");
    const servicesCollection = techMaintenance.collection("services");

    app.post('/add-service', async (req, res) => {
      const data = req.body.formData;

      // uploading image to cloudinary and receiving the image url
      const imageString = data.imageString;
      const uploadResponse = await cloudinary.uploader.upload(imageString, {
        upload_preset: 'tech_main_assgnmnt'
      });
      const imageURL = uploadResponse.secure_url;

      const serviceName = data.serviceName;
      const price = data.price;
      const description = data.description;

      const doc = {
        serviceName,
        imageURL,
        price,
        description
      }

      const result = await servicesCollection.insertOne(doc);

      res.send(result);
    })
  } finally {

  }
}

run().catch((err) => console.error(err))

app.listen(port, () => {
  console.log(`service site server running on port ${port}`);
})