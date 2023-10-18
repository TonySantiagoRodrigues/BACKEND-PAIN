require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const connection = require("./db");
const userRoutes = require("./api/users");
const authRoutes = require("./api/auth");

const app = express();

// Middlewares de segurança e logging
app.use(helmet());
app.use(morgan('tiny'));

// Middleware para parsing JSON
app.use(express.json());

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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);  // Imprime detalhes do erro no console
    res.status(500).send({ message: 'Internal Server Error' });
});

// Database connection
connection();

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Connected to MongoDB`);
});
