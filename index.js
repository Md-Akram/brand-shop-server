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


        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        app.post('/cart', async (req, res) => {
            const product = req.body
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

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id
            const updatedProduct = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateProduct = {
                $set: {
                    name: updatedProduct.name,
                    brandName: updatedProduct.brandName,
                    imgURL: updatedProduct.imgURL,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    ratings: updatedProduct.ratings
                }
            }
            const result = await productsCollection.updateOne(filter, updateProduct, options)
            res.send(result)
        })

        app.delete('/deleteProduct', async (req, res) => {
            const { userId, productId } = req.body
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