require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();

// Middlewares
app.use(express.json());

// Configuração do CORS
const corsOptions = {
  origin: "https://dazzling-youtiao-f5997c.netlify.app/", // Especifique a URL do seu front-end aqui
};

app.use(cors(corsOptions)); // Aplicar as configurações CORS

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
