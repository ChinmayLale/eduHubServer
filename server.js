const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const uri = "mongodb+srv://astrochinmay:astrochinmay@eduhub.2sgtwed.mongodb.net/?retryWrites=true&w=majority&appName=EduHub"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
var users = null
var courseList = ""
const app = express();
app.use(cors());
app.use(express.json());
app.get('/get', (req, res) => {
  res.json({ users });
});

app.get('/get/courses', async (req, res) => {
  await client.connect();
  const usersCollection = client.db("EduHub").collection("courses");
  courseList = await usersCollection.find({}).toArray();
  res.json(courseList);
  // await client.close();
});


app.post('/addToCart', async (req, res) => {
  // console.log(req.body)
  const obj = req.body;
  delete obj._id;
  console.log(obj);
  await client.connect();
  const dataBase = client.db("EduHub").collection("eduHubCart");
  const initialData = await dataBase.find({}).toArray()
  // console.log(initialData)
  const existingDoc = await dataBase.findOne({ email: obj.userEmail });
  console.log(existingDoc)
  try {
    if (existingDoc) {
      await dataBase.updateOne(
        { email: obj.userEmail },
        { $push: { courses: obj } }
      );
      res.send("Added to Cart");
      await client.close();
    } else {
      dataBase.insertOne({ email: obj.userEmail,courses:[ obj] });
      res.send("Added to Cart");
      // await client.close();
    }
  } catch (error) {
    console.log("Error Occured while adding data to cart")
    res.send('Error Occured while adding data to cart')
  }
})


app.post('/cartData',async(req , res)=>{
  const {email} = req.body;
  console.log(req.body);
  try {
    await client.connect();
    const database =  client.db("EduHub").collection("eduHubCart");
    const data = await database.find({email:email}).toArray();
    console.log(data);
    res.send(data);
  } catch (error) {
    console.log("Error Occured During getting Cart Data")
    res.send('Error Occured During getting Cart Data')
  }
})


const getNearByUsers = async () => {
  try {
    await client.connect();
    const collectionData = client.db("EduHub").collection("userLocations");
    const data = await collectionData.find({}).toArray();
    // await client.close();
    return data;
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    // Handle error appropriately, e.g., send an error response to the client
  }
};

app.get('/nearByUsers', async (req, res) => {
  try {
    const nearbyUsers = await getNearByUsers();
    res.send(nearbyUsers); // Send the actual data returned by getNearByUsers
  } catch (error) {
    console.error("Error handling nearby users request:", error);
  }
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
  async function run() {
    try {
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");

      const usersCollection_users = client.db("EduHub").collection("Students");
      users = await usersCollection_users.find({}).toArray();

    } finally {
      await client.close();
    }
  }

  run().catch(console.dir);
});



// ==========================================================================================================================================
