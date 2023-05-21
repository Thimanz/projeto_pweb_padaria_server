import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
app.use(express.json());
import axios from "axios";

const { DB_URL, SERVER_PORT } = process.env;

app.get("/produtos", async (req, res) => {
    const database = (await axios.get(DB_URL)).data;
    const produtosArray = database.items;
    let produtos = {};
    produtosArray.forEach((produto) => {
        delete produto.links;
        produtos[produto.descricao.toLowerCase().replaceAll(/\s/g, "")] =
            produto;
    });
    res.status(200).send(produtos);
});

// app.post("/produtos", (req, res) => {
//     const produtos = req.body;
//     Object.values(produtos).forEach(async (produto) => {
//         await axios.post(DB_URL, produto);
//     });
//     res.status(201).send({ msg: "ok" });
// });

app.listen(SERVER_PORT, () => {
    console.log(`Porta ${SERVER_PORT} inicializada`);
});
