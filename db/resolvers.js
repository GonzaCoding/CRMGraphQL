const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: ".env"});

const crearToken = (usuario, secret, expiresIn) => {
    const { id, email, nombre, apellido} = usuario;

    return jwt.sign({id, email, nombre, apellido}, secret, {expiresIn});
}


// resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            const usuarioID = jwt.verify(token, process.env.SECRET);

            return usuarioID;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}, ctx) => {
            const {email,password} = input;
            
            // revisar si el usuario está registrado
            const existeUsuario = await Usuario.findOne({email});
            if(existeUsuario){
                throw new Error("El usuario se encuentra registrado");
            }

            // hashear password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);


            // guardar en la BD
            try {
                const usuario = new Usuario(input);
                usuario.save();
                return usuario;
            } catch (err) {
                console.log(err);
            }
        },
        autenticarUsuario: async (_, {input}) => {
            //ver si el usuario existe
            const {email,password} = input;
            
            // revisar si el usuario está registrado
            const existeUsuario = await Usuario.findOne({email});
            if(!existeUsuario){
                throw new Error("El usuario no existe");
            }

            // revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if(!passwordCorrecto) {
                throw new Error("El password es incorrecto");
            }

            // crear token
            return {
                token: crearToken(existeUsuario, process.env.SECRET, '24h')
            }

        },
        nuevoProducto: async (_, {input}) => {
            try {
                const producto = new Producto(input);

                // almacenar en la DB
                const resultado = await producto.save();

                return resultado;
            } catch (err) {
                console.log(err);
            }
        }
    }

}

module.exports = resolvers;