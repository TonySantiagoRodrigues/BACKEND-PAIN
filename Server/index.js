require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./api/users");
const authRoutes = require("./api/auth");

const app = express();

// Middlewares
app.use(express.json());

// Configuração avançada do CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://frontend-pain.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if ('OPTIONS' === req.method) {
        res.sendStatus(204);
    } else {
        next();
    }
});

// Servir arquivos estáticos, incluindo o favicon.ico
app.use(express.static(__dirname));

// Rota específica para o favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/favicon.ico');
});

// Endpoint de Verificação
app.get("/status", (req, res) => {
    res.send("Server is running!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Database connection
connection();

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Using MongoDB at: ${process.env.MONGO_URL}`);
});
