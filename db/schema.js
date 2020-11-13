const { gql } = require('apollo-server');

// schemas
const typeDefs = gql`


    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        creado: String
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    type Token {
        token: String
    }

    type Query {
        obtenerUsuario(token: String!): Usuario
    }
    
    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token

        # Productos
        nuevoProducto(input: ProductoInput): Producto
    }
`;

module.exports = typeDefs;