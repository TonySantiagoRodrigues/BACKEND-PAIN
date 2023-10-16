const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const geoip = require('geoip-lite');
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user || !await bcrypt.compare(req.body.password, user.password)) {
            return res.status(401).send({ message: "Invalid credentials" }); // Mensagem generalizada
        }

        if (user.approvalCode !== req.body.approvalCode) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const ip = req.ip || req.connection.remoteAddress;

        // Obter detalhes de localização do IP
        const ipDetails = geoip.lookup(ip);
        const location = ipDetails ? `${ipDetails.city}, ${ipDetails.region}` : 'Desconhecido';

        user.lastKnownIp = ip;
        user.deviceId = req.body.deviceId;
        await user.save();

        // Configuração de envio de e-mail usando nodemailer para hotmail
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'seu-email-aqui@hotmail.com',
            subject: 'Detalhes de login do usuário',
            text: `Detalhes:\nIP: ${ip}\nLocalização: ${location}\nDispositivo: ${req.body.deviceId}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Erro ao enviar o email:', error);
            } else {
                console.log('Email enviado:', info.response);
            }
        });

        try {
            const token = user.generateAuthToken();
            res.status(200).send({ data: token, message: "logged in successfully" });
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            res.status(500).send({ message: "Failed to generate authentication token." });
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        deviceId: Joi.string().min(5).max(50).required().label("Device ID"), // Ajuste conforme necessário
        approvalCode: Joi.string().length(8).required().label("Approval Code"), // Supondo um comprimento de 8
    });
    return schema.validate(data);
};

module.exports = router;
