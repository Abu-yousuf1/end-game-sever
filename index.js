const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9fdd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(process.env.DB_PASS, process.env.DB_USER)
async function run() {
    try {
        await client.connect();

        const database = client.db('PHeroTask')
        const blogCollection = database.collection('Blogs')
        const experienceCollection = database.collection('Experiences')
        const userCollection = database.collection('userCollection')


        // find all Blogs........
        app.get('/blog', async (req, res) => {
            const cursor = blogCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // find by id.........
        app.get('/blogbyid/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            console.log(filter, "id")
            const blog = await blogCollection.findOne(filter);
            res.send(blog)
        })

        //  find blog filter status........
        app.get('/blogbystatus', async (req, res) => {
            const query = { status: "approve" }
            const cursor = blogCollection.find(query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size)
            console.log(req.query)
            const count = await cursor.count();
            let blogs;
            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.limit(size).toArray();
            }

            res.send({
                count,
                blogs
            });
        })

        // insert Blog...............
        app.post('/blog', async (req, res) => {
            const blog = req.body;
            console.log(blog)
            const result = await blogCollection.insertOne(blog)
            res.json(result)
        })

        // Change blog status..........
        app.put('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateDoc = { $set: { status: 'approve' } };
            const result = await blogCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        // delete blog in mongodb...........
        app.delete('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(filter)
            res.json(result)
        })

        // find all experiences........
        app.get('/expe', async (req, res) => {
            const cursor = experienceCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        // find all experiences........
        app.get('/expeByQuery/:category', async (req, res) => {
            const category = req.params.category;
            const filter = { category: category }
            console.log(filter, "query")
            const cursor = experienceCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        })

        // insert  experience...........
        app.post('/expe', async (req, res) => {
            const expe = req.body;
            const result = await experienceCollection.insertOne(expe)
            res.send(result)
        })

        // save user in mongoDb
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        // find user by email..........
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const filter = { email: email }
            const result = await userCollection.findOne(filter)
            console.log(result)
            res.send(result)
        })

        //Make admin..........................
        app.put('/makeadmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // verification admin........................
        app.get('/isadmin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    } finally {

    }
} run().catch(console.dir)

app.get('/', (req, res) => {
    console.log("hello world")
    res.send('hello world')
})

app.listen(port, () => {
    console.log('listening to ', port)
})