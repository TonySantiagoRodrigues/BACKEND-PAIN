const checkDeviceId = async (req, res, next) => {
    const { deviceId } = req.body;
    
    // Verificar se o deviceId está presente e é uma string não vazia
    if (!deviceId || typeof deviceId !== 'string') {
        return res.status(400).send({ message: "Device ID is required and must be a string" });
    }
    
    req.deviceId = deviceId; // Armazenar deviceId no objeto de solicitação para uso posterior
    
    next(); // Passar para o próximo middleware ou rota
};

module.exports = checkDeviceId;
