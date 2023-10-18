const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require('cors');  // Importando o pacote CORS
require('dotenv').config();

const router = express.Router();
const { User, validate } = require("../models/user");
const { gerarCodigoUnico } = require('../utils');

// Configuração do CORS
const corsOptions = {
    origin: 'https://frontend-pain.vercel.app',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true,
    optionsSuccessStatus: 200
};

router.use(cors(corsOptions));  // Usando o middleware CORS na rota

// Middleware para lidar com solicitações OPTIONS
router.options("/", (req, res) => {
    res.sendStatus(200);
});

// Rota POST para criar um novo usuário
router.post("/", async (req, res) => {
    try {
        // Validação dos dados de entrada usando Joi
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        // Verificar se o usuário já existe com o mesmo e-mail
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(409).send({ message: "O usuário com o e-mail informado já existe!" });

        // Restante do seu código...

    } catch (error) {
        console.error("Erro no registro do usuário:", error);  // Registro de erro detalhado
        res.status(500).send({ message: "Erro Interno do Servidor" });
    }
});

module.exports = router;
