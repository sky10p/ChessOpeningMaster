import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from 'cors';


const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/chess_opening_master";
const client = new MongoClient(uri);

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(express.json());
app.use(cors());
app.get("/repertoires", async (req, res)=>{
    await client.connect();
    const db = client.db("chess-opening-master");
    const repertoires = await db.collection("repertoires").find({}).project({
        name: 1,
        _id: 1,
    }).toArray();
    res.json(repertoires);
})

app.get("/repertoires/:id", async (req, res)=>{
    await client.connect();
    const {id} = req.params;
    const db = client.db("chess-opening-master");
    const repertoire = await db.collection("repertoires").findOne({_id: new ObjectId(id)});
    res.json(repertoire);
})

app.post("/repertoires", async (req, res)=>{
    await client.connect();
    const {name, orientation, moveNodes} = req.body;
    const db = client.db("chess-opening-master");
    const repertoire = await db.collection("repertoires").insertOne({name, moveNodes, orientation});
    res.json(repertoire);
});

app.put("/repertoires/:id", async (req, res)=>{
    await client.connect();
    const {id} = req.params;
    const {name, orientation, moveNodes} = req.body;
    const db = client.db("chess-opening-master");
    const repertoire = await db.collection("repertoires").findOneAndUpdate({_id: new ObjectId(id)}, {$set: {name, moveNodes, orientation}});
    res.json(repertoire);
});

app.put("/repertoires/:id/name", async (req, res)=>{
    await client.connect();
    const {id} = req.params;
    const {name} = req.body;
    const db = client.db("chess-opening-master");
    const repertoire = await db.collection("repertoires").findOneAndUpdate({_id: new ObjectId(id)}, {$set: {name}});
    res.json(repertoire);
});

app.delete("/repertoires/:id", async (req, res)=>{
    await client.connect();
    const {id} = req.params;
    const db = client.db("chess-opening-master");
    const repertoire = await db.collection("repertoires").deleteOne({_id: new ObjectId(id)});
    res.json(repertoire);
});

app.listen(port, () => {
    console.log(process.env.MONGODB_URI)
    console.log(`Example app listening at http://localhost:${port}`)
});