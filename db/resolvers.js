const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Cliente = require('../models/cliente');
const Pedido = require('../models/pedido');

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
        },
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            }  catch (err) {
                console.log(err);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({vendedor: ctx.usuario.id });
                return pedidos;
            }  catch (err) {
                console.log(err);
            }
        },
        obtenerPedido: async (_, {id}, ctx) => {
            //ver si el pedido existe
            const pedido = await Pedido.findById(id);

            if(!pedido) {
                throw new Error("No existe el pedido");
            }

            //si tiene credenciales
            if(pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El pedido es de otro usuario, no puedes verlo");
            }

            return pedido;

        },
        obtenerPedidosEstado: async (_, {estado},ctx) => {
            const pedidos = await Pedido.find({vendedor: ctx.usuario.id, estado});
            return pedidos;
        },
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([
                { $match: { estado: "COMPLETADO"} },
                { $group: {
                    _id: "$cliente",
                    total: {$sum: "$total"}
                }},
                {
                    $lookup: {
                        from: "clientes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cliente"
                    }
                },
                {
                    $limit: 10
                },
                {
                    $sort: { total: -1 }
                }
            ]);

            return clientes;
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match: { estado: "COMPLETADO"} },
                { $group: {
                    _id: "$vendedor",
                    total: {$sum: "$total"}
                }},
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "_id",
                        foreignField: "_id",
                        as: "vendedor"
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                },

            ]);

            return vendedores;
        },
        buscarProducto: async (_, {texto}) => {
            const productos = await Producto.find({$text: { $search: texto }}).limit(10);

            return productos;
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
        },
        nuevoPedido: async (_,{input}, ctx) => {
            const {cliente} = input;

            //verificar si el cliente existe
            const existeCliente = await Cliente.findById(cliente);

            if(!existeCliente){
                throw new Error("El cliente no existe");
            }

            //verificar si el cliente es del vendedor
            if(existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El cliente es de otro usuario, no puedes realizar la operación");
            }

            //revisar stock disponible
            for await (const articulo of input.pedido) {
                const {id} = articulo;

                const producto = await Producto.findById(id);

                if(articulo.cantidad > producto.existencia) {
                    throw new Error (`El artículo ${producto.nombre} excede la cantidad disponible`);
                } else {
                    //restar stock
                    producto.existencia -= articulo.cantidad;
                    await producto.save();
                }
            }

            //crear nuevo pedido
            const nuevoPedido = new Pedido(input);

            //asignar vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            //guardar en BD
            const resultado = await nuevoPedido.save();

            return resultado;

        },
        actualizarPedido: async (_,{id, input},ctx) => {
            const {cliente, pedido} = input;
            
            //si el pedido existe
            const existePedido = await Pedido.findById(id);

            if(!existePedido) {
                throw new Error("El pedido no existe");
            }

            // si el cliente existe
            const existeCliente = await Cliente.findById(cliente);

            if(!existeCliente){
                throw new Error("El cliente no existe");
            }

            //si el cliente y pedido pertenece al vendedor
            if(existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El cliente es de otro usuario, no puedes realizar la operación");
            }

            //revisar stock
            if(pedido) {
                for await (const articulo of pedido) {
                    const {id} = articulo;
    
                    const producto = await Producto.findById(id);
    
                    if(articulo.cantidad > producto.existencia) {
                        throw new Error (`El artículo ${producto.nombre} excede la cantidad disponible`);
                    } else {
                        //restar stock
                        producto.existencia -= articulo.cantidad;
                        await producto.save();
                    }
                }
            }
            

            //actualizar pedido
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
            return resultado;
        },
        eliminarPedido: async (_,{id}, ctx) => {
            
            //si el pedido existe
            const pedido = await Pedido.findById(id);

            if(!pedido) {
                throw new Error("El pedido no existe");
            }

            //si el cliente y pedido pertenece al vendedor
            if(pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("El pedido es de otro usuario, no puedes realizar la operación");
            }

            //eliminar
            await Pedido.findOneAndDelete({_id: id});

            return "Pedido eliminado";

        }
    }

}

module.exports = resolvers;