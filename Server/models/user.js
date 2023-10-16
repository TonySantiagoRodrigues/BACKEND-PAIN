const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, minlength: 5, maxlength: 255 }, // Unique Email
    password: { type: String, required: true, minlength: 8, maxlength: 1024 },  // Consider using hashing before storing
    lastKnownIp: { type: String, default: null },
    deviceId: { type: String, default: null },
    approvalCode: { type: String, default: null },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

const User = mongoose.model("user", userSchema);

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

module.exports = { User, validate };
