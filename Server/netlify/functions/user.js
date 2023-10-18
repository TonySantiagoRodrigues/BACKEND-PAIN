const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require('dotenv').config();
const { User, validate } = require("../../models/user");
const { gerarCodigoUnico } = require('../../utils');

let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.HOTMAIL_USER,
        pass: process.env.HOTMAIL_PASS
    }
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    const body = JSON.parse(event.body);
    
    try {
        const { error } = validate(body);
        if (error) return { statusCode: 400, body: JSON.stringify({ message: error.details[0].message }) };

        let user = await User.findOne({ email: body.email });
        if (user) return { statusCode: 409, body: JSON.stringify({ message: "User with given email already exists!" }) };

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(body.password, salt);
        
        const approvalCode = gerarCodigoUnico(); 

        user = new User({
            ...body,
            password: hashPassword,
            approvalCode: approvalCode
        });
        await user.save();

        let mailOptions = {
            from: process.env.HOTMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "Seu código de aprovação",
            text: `Seu código de aprovação é: ${approvalCode}`
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User created successfully" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};
