const mongoose = require("mongoose");

module.exports = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true, // Adicionado para evitar avisos de depreciação
        useFindAndModify: false, // Adicionado para evitar avisos de depreciação
        autoReconnect: true, // Tentativa de reconexão automática
        reconnectTries: Number.MAX_VALUE, // Nunca pare de tentar reconectar
        reconnectInterval: 500, // Reconectar a cada 500ms se a conexão for perdida
    };

    mongoose.connect(process.env.MONGO_URL, connectionParams)
        .then(() => {
            console.log("Connected to database successfully");
        })
        .catch((error) => {
            console.error("Error connecting to the database:");
            console.error(error);
            if (isProduction) {
                process.exit(1); // Exit the application in case of database connection error in production
            }
        });

    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected! Trying to reconnect...');
        mongoose.connect(process.env.MONGO_URL, connectionParams);
    });
};
