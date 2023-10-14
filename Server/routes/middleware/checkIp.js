const checkIp = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    // Adicional: Verificar se o IP é uma string e não está vazia (para IPv4 e IPv6)
    if (!ip || typeof ip !== 'string' || !ip.match(/(?:[\d]{1,3}\.){3}[\d]{1,3}|[a-f\d:]{3,}/i)) {
        return res.status(400).send({ message: "IP address could not be determined or is invalid" });
    }
    
    req.userIp = ip; // Armazenar IP no objeto de solicitação para uso posterior
    
    next(); // Passar para o próximo middleware ou rota
};

module.exports = checkIp;
