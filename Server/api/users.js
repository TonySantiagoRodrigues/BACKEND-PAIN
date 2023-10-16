const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require('dotenv').config();

const router = express.Router();
const { User, validate } = require("../models/user");
const { gerarCodigoUnico } = require('../utils');

// Criar uma única instância de transportador de e-mail
let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.HOTMAIL_USER,
        pass: process.env.HOTMAIL_PASS
    }
});

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(409).send({ message: "User with given email already exists!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const ip = req.ip || req.connection.remoteAddress;

        const approvalCode = gerarCodigoUnico();  

        user = new User({
            ...req.body,
            password: hashPassword,
            lastKnownIp: ip,
            deviceId: req.body.deviceId,
            approvalCode: approvalCode
        });
        await user.save();

        // Enviando o e-mail usando async/await
        let mailOptions = {
            from: process.env.HOTMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "Seu código de aprovação",
            text: `Seu código de aprovação é: ${approvalCode}`
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return res.status(201).send({ message: "User created successfully" });

    } catch (error) {
        console.error("Error in user registration:", error);  // Log de erro detalhado
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
