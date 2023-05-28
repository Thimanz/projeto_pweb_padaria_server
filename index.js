import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
app.use(express.json());
import axios from "axios";

const { DB_PRODUTOS_URL, DB_CLIENTES_URL, SERVER_PORT } = process.env;

app.get("/produtos", async (req, res) => {
    const database = (await axios.get(DB_PRODUTOS_URL)).data;
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
//         await axios.post(DB_PRODUTOS_URL, produto);
//     });
//     res.status(201).send({ msg: "ok" });
// });

app.post("/clientes", async (req, res) => {
    const cliente = req.body;
    try {
        const respostaCliente = (await axios.post(DB_CLIENTES_URL, cliente))
            .data;
        delete respostaCliente.links;
        res.status(201).send(respostaCliente);
    } catch (erro) {
        console.log(erro);
        if (erro.response) {
            res.status(erro.response.status);
        }
    }
});

app.get("/clientes", async (req, res) => {
    const database = (await axios.get(DB_CLIENTES_URL)).data;
    const clientesArray = database.items;
    let clientes = {};
    clientesArray.forEach((cliente) => {
        delete cliente.links;
        clientes[cliente.codigo] = cliente;
    });
    res.status(200).send(clientes);
});

app.listen(SERVER_PORT, () => {
    console.log(`Porta ${SERVER_PORT} inicializada`);
});
