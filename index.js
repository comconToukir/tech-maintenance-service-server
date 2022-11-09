const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


const run = async () => {
  try {
    const techMaintenance = client.db("techMaintenance");
    const servicesCollection = techMaintenance.collection("services");
    const reviewsCollection = techMaintenance.collection("reviews");

    // get all services
    app.get('/services', async (req, res) => {
      const query = {};

      const services = await servicesCollection.find(query).toArray();

      res.send(services);
    })

    // get 3 services for the home page
    app.get('/services-limited', async (req, res) => {
      const query = {};

      const services = await servicesCollection.find(query).limit(3).toArray();

      res.send(services);
    })

    // get individual service
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      
      const query = { _id: ObjectId(id)};

      const service = await servicesCollection.findOne(query);

      res.send(service);
    })

    // posting a new service
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

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;

      const query = { serviceId: ObjectId(id) }

      const options = {
        sort: { updatedDate: -1 }
      }

      const reviews = await reviewsCollection.find(query, options).toArray();

      res.send(reviews);
    })
  } finally {

  }
}

run().catch((err) => console.error(err))

app.listen(port, () => {
  console.log(`service site server running on port ${port}`);
})