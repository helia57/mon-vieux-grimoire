const rateLimit = require("express-rate-limit");

const reqlimite = rateLimit ({
    windowMs: 1 * 60 * 1000, 
    max: 100,
    message: "trop de requêtes, veuillez réessayer plus tard ",
    standardHeaders: true, 

    //limite de 100 requêtes par IP toute les 1 min

});

module.exports = reqlimite;

