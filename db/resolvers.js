const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Cliente = require('../models/cliente');
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
        },
        obtenerProductos: async () => {
            try {

                const productos = await Producto.find({});
                return productos;

            } catch (err) {
                console.log(err);
            }
        },
        obtenerProducto: async (_, {id}) => {
            //revisar si existe
            const producto = await Producto.findById(id);

            if(!producto) {
                throw new Error("Producto no encontrado");
            }

            return producto;
        },
        obtenerClientes: async () => {
            try {

                const clientes = await Cliente.find({});
                return clientes;

            } catch (err) {
                console.log(err);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {

                const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
                return clientes;

            } catch (err) {
                console.log(err);
            }
        },
        obtenerCliente: async (_, {id}, ctx) => {
            //revisar si el cliente existe
            const cliente = await Cliente.findById(id);

            if(!cliente){
                throw new Error("Cliente no encontrado");
            }

            //quien lo creo puede verlo
            if(cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El cliente es de otro usuario, no puedes verlo");
            }

            return cliente;
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
        },
        actualizarProducto: async (_,{id, input}) => {
            //revisar si existe
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error("Producto no encontrado");
            }

            // guardar en la BD
            producto = await Producto.findOneAndUpdate({_id: id}, input, {new: true});

            return producto;

        },
        eliminarProducto: async (_, {id}) => {
            //revisar si existe
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error("Producto no encontrado");
            }

            // eliminar
            await Producto.findByIdAndDelete({_id: id});

            return "Producto eliminado";
        },
        nuevoCliente: async (_, {input}, ctx) => {
            //verificar si está registrado
            const {email} = input;

            const cliente = await Cliente.findOne({email});

            if(cliente){
                throw new Error("Cliente ya existe");
            }

            const nuevoCliente = new Cliente(input);

            //asignar vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            //guardar en BD
            try {
                const resultado = await nuevoCliente.save();

                return resultado;
            } catch (err) {
                console.log(err);
            }
            
        },
        actualizarCliente: async (_, {id, input}, ctx) => {
            //verificar si existe
            let cliente = await Cliente.findById(id);

            if(!cliente){
                throw new Error("El cliente no existe");
            }

            //verificar si es el vendedor el que edita
            if(cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El cliente es de otro usuario, no puedes editarlo");
            }

            //guardar
            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
            return cliente;
        },
        eliminarCliente: async (_, {id}, ctx) => {
            //verificar si existe
            let cliente = await Cliente.findById(id);

            if(!cliente){
                throw new Error("El cliente no existe");
            }

            //verificar si es el vendedor el que edita
            if(cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El cliente es de otro usuario, no puedes editarlo");
            }

            //eliminar
            await Cliente.findOneAndDelete({_id: id});
            return "Cliente eliminado";
        }
    }

}

module.exports = resolvers;