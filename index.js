import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
const app = express();
app.use(
    express.json(),
    cors({
        origin: "*",
    })
);
import axios from "axios";
import nodemailer from "nodemailer";

const {
    DB_PRODUTOS_URL,
    DB_CLIENTES_URL,
    DB_CESTAS_URL,
    SERVER_PORT,
    EMAIL,
    SENHA,
} = process.env;

app.get("/produtos", async (req, res) => {
    const database = (await axios.get(DB_PRODUTOS_URL)).data;
    const produtosArray = database.items;
    let produtos = {};
    produtosArray.forEach((produto) => {
        delete produto.links;
        produtos[produto.codigo] = produto;
        delete produto.codigo;
    });
    res.status(200).send(produtos);
});

app.get("/produtos/:codigo", async (req, res) => {
    const codigo = req.params.codigo;
    try {
        const produto = (await axios.get(DB_PRODUTOS_URL + codigo)).data;
        delete produto.links;
        delete produto.codigo;
        res.status(200).send(produto);
    } catch (erro) {
        if (erro.response) {
            res.status(erro.response.status).send({
                msg: "Cliente não existe",
            });
        }
    }
});

// app.post("/produtos", (req, res) => {
//     const produtos = req.body;
//     Object.values(produtos).forEach(async (produto) => {
//         await axios.post(DB_PRODUTOS_URL, produto);
//     });
//     res.status(201).send({ msg: "ok" });
// });

//clientes
app.post("/clientes", async (req, res) => {
    const cliente = req.body;
    try {
        const respostaDB = (await axios.post(DB_CLIENTES_URL, cliente)).data;
        delete respostaDB.links;
        res.status(201).send(respostaDB);
    } catch (erro) {
        if (erro.response) {
            res.status(erro.response.status).send({
                msg: "Erro ao salvar dados",
            });
        }
    }
});

app.get("/clientes/:email", async (req, res) => {
    const database = (await axios.get(DB_CLIENTES_URL)).data;
    const clientesArray = database.items;
    const cliente = clientesArray.find(
        (cliente) => cliente.email === req.params.email
    );
    if (cliente) {
        delete cliente.links;
        res.status(200).send(cliente);
    } else {
        res.status(404).send({ msg: "Cliente não encontrado" });
    }
});

//cestas
app.post("/cestas", async (req, res) => {
    const cesta = req.body;
    cesta["valorUnitario"] = 0;
    cesta["valorTotal"] = 0;
    try {
        const respostaDB = (await axios.post(DB_CESTAS_URL, cesta)).data;
        delete respostaDB.links;
        res.status(201).send(respostaDB);
    } catch (erro) {
        if (erro.response) {
            res.status(erro.response.status).send({
                msg: "Erro ao salvar dados",
            });
        }
    }
});

app.get("/cestas/:sessionId", async (req, res) => {
    const database = (await axios.get(DB_CESTAS_URL)).data;
    const cestasArray = database.items;
    let cestas = {};
    cestasArray.forEach((item) => {
        delete item.links;
        const itens = cestas[item.sessionid] || [];
        itens.push(item);
        cestas[item.sessionid] = itens;
        delete item.sessionid;
    });
    const cesta = cestas[req.params.sessionId] || [];
    res.status(200).send(cesta);
});

// sessão do usuario
app.get("/session/:codigoCliente", async (req, res) => {
    const database = (
        await axios.get(
            DB_CESTAS_URL + `?q={"codcliente": ${req.params.codigoCliente}}`
        )
    ).data;
    if (database.count) {
        const sessionId = database.items[0].sessionid;
        res.status(200).send({ sessionId });
    } else {
        res.status(404).send({ msg: "Sessão não encontrada" });
    }
});

app.post("/email", (req, res) => {
    const dadosEmail = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: SENHA,
        },
    });
    try {
        const mailOptions = {
            from: EMAIL,
            to: dadosEmail.email,
            subject: `Seu cadastro foi concluído, ${dadosEmail.nome}`,
            text: `Olá ${dadosEmail.nome}, seu cadastro na Padoca foi concluído.\nSua senha é: ${dadosEmail.senha}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info);
            }
        });
        res.status(201).send({ msg: "Email enviado" });
    } catch (erro) {
        if (erro.response) {
            res.status(erro.response.status).send({
                msg: "Erro ao enviar email",
            });
        }
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Porta ${SERVER_PORT} inicializada`);
});
