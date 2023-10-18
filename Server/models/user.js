// Importando as dependências necessárias.
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Definindo o esquema do usuário usando o Mongoose.
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        minlength: 5, 
        maxlength: 255 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8, 
        maxlength: 1024 
    },
    lastKnownIp: { type: String, default: null },
    deviceId: { type: String, default: null },
    approvalCode: { type: String, default: null },
});

// Adicionando um método ao esquema do usuário para gerar um token de autenticação.
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

// Criando o modelo 'User' usando o esquema definido anteriormente.
const User = mongoose.model("user", userSchema);

// Função para validar os dados de entrada do usuário.
const validate = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50).required().label("First Name"),
        lastName: Joi.string().min(2).max(50).required().label("Last Name"),
        email: Joi.string().min(5).max(255).email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        approvalCode: Joi.string().min(6).max(50).label("Approval Code"),
    });
    return schema.validate(data);
};

// Exportando o modelo 'User' e a função de validação.
module.exports = { User, validate };
