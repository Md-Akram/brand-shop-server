const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcdfjvb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("brandDB");
        const productsCollection = database.collection("products");
        const cartCollection = database.collection("cart")

        // app.get('/users', async (req, res) => {
        //     const cursor = userCollection.find()
        //     const data = await cursor.toArray()
        //     res.send(data)
        // })

        app.post('/products', async (req, res) => {
            const product = req.body
            console.log('new product', product);
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        app.post('/cart', async (req, res) => {
            const product = req.body
            console.log('new product in cart', product);
            const result = await cartCollection.insertOne(product)
            res.send(result)
        })

        app.get('/cart/:id', async (req, res) => {
            const id = req.params.id
            const query = { uid: `${id}` }
            const cursor = cartCollection.find(query)
            const cartProducts = await cursor.toArray()
            res.send(cartProducts)
        })

        app.get('/products/:name', async (req, res) => {
            const name = req.params.name
            const capitalizedString = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            const query = { brandName: `${capitalizedString}` };
            const cursor = productsCollection.find(query)

            const askedProducts = await cursor.toArray()

            res.send(askedProducts)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(`${id}`) }
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        // app.put('/users/:id', async (req, res) => {
        //     const id = req.params.id
        //     const updatedUser = req.body
        //     const filter = { _id: new ObjectId(id) }
        //     const options = { upsert: true }
        //     const updateUser = {
        //         $set: {
        //             name: updatedUser.name,
        //             email: updatedUser.email
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updateUser, options)
        //     res.send(result)
        //     console.log(id, updatedUser);
        // })

        app.delete('/deleteProduct', async (req, res) => {
            const { userId, productId } = req.body
            console.log(userId, productId);
            const query = { "uid": `${userId}`, _id: new ObjectId(`${productId}`) }
            const result = await cartCollection.deleteOne(query)
            res.send(result)
        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('SIMPLE CRUD IS RUNNING')
})

app.listen(port, () => {
    console.log(`Simple crud is running on port , ${port}`)
})