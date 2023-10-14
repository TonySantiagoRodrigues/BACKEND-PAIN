const mongoose = require("mongoose");

module.exports = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
};
