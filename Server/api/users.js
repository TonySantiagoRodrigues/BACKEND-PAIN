const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require('dotenv').config();

const router = express.Router();
const { User, validate } = require("../models/user");
const { gerarCodigoUnico } = require('../utils');

let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.HOTMAIL_USER, // Usando variável de ambiente para o e-mail do Hotmail
        pass: process.env.HOTMAIL_PASS  // Usando variável de ambiente para a senha do Hotmail
    }
});

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(409).send({ message: "User with given email already Exist!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const ip = req.ip || req.connection.remoteAddress;
        const { deviceId } = req.body;

        const approvalCode = gerarCodigoUnico();  

        user = new User({
            ...req.body,
            password: hashPassword,
            lastKnownIp: ip,
            deviceId: deviceId,
            approvalCode: approvalCode
        });
        await user.save();

        // Enviando o e-mail
        let mailOptions = {
            from: process.env.HOTMAIL_USER, // Usando variável de ambiente para o e-mail do Hotmail
            to: process.env.ADMIN_EMAIL,  // Mantendo a variável de ambiente para o e-mail do administrador
            subject: "Seu código de aprovação",
            text: `Seu código de aprovação é: ${approvalCode}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Error sending the email" });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(201).send({ message: "User created successfully" });
            }
        });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
