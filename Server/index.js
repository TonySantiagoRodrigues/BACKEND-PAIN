require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./api/users");
const authRoutes = require("./api/auth");

const app = express();

// Middlewares
app.use(express.json());

// Configuração simplificada do CORS usando o pacote cors
const corsOptions = {
    origin: 'https://frontend-pain.vercel.app',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true
};

app.use(cors(corsOptions));

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
