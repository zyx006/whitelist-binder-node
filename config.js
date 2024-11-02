// config.js
require('dotenv').config();

module.exports = {
    rcon: {
        host: process.env.RCON_HOST,
        port: Number(process.env.RCON_PORT),
        password: process.env.RCON_PASSWORD
    },
    port: Number(process.env.PORT)
};
