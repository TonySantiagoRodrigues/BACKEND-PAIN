/**
 * Middleware to validate the presence and format of a deviceId in the request body.
 * If valid, the deviceId is attached to the request object for further processing.
 * Otherwise, an error response is sent.
 */
const checkDeviceId = async (req, res, next) => {
    const { deviceId } = req.body;

    // Verificar se o deviceId está presente, é uma string não vazia e tem um comprimento mínimo/máximo
    if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 5 || deviceId.length > 50) {
        return res.status(400).send({ message: "Device ID is required, must be a string, and should be between 5 to 50 characters long." });
    }

    req.deviceId = deviceId;

    next();
};

module.exports = checkDeviceId;
