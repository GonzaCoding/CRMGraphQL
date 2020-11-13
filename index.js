const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

// conectar BD
conectarDB();

// crear servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';

        if(token) {
            try {
                const usuario = jwt.verify(token, process.env.SECRET);

                //console.log(usuario);

                return {
                    usuario,
                };
            } catch (err) {
                console.log("Hubo un error");
                console.log(err);
            }
        }

    }
});

// arrancar el servidor
server.listen().then( ({url}) => {
    console.log(`Servidor listo en la url: ${url}`);
});