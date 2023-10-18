const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const geoip = require('geoip-lite');
const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
            headers: { "Allow": "POST" }
        };
    }

    const body = JSON.parse(event.body);

    try {
        const { error } = validate(body);
        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: error.details[0].message })
            };
        }

        const user = await User.findOne({ email: body.email });
        if (!user || !await bcrypt.compare(body.password, user.password)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid credentials" })
            };
        }

        if (user.approvalCode !== body.approvalCode) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid credentials" })
            };
        }

        const ip = event.headers['client-ip'];

        // Obter detalhes de localização do IP
        const ipDetails = geoip.lookup(ip);
        const location = ipDetails ? `${ipDetails.city}, ${ipDetails.region}` : 'Desconhecido';

        user.lastKnownIp = ip;
        user.deviceId = body.deviceId;
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
            text: `Detalhes:\nIP: ${ip}\nLocalização: ${location}\nDispositivo: ${body.deviceId}`
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
            return {
                statusCode: 200,
                body: JSON.stringify({ data: token, message: "logged in successfully" })
            };
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to generate authentication token." })
            };
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        deviceId: Joi.string().min(5).max(50).required().label("Device ID"),
        approvalCode: Joi.string().length(8).required().label("Approval Code")
    });
    return schema.validate(data);
};