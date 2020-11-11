const { gql } = require('apollo-server');

// schemas
const typeDefs = gql`

    type Curso {
        titulo: String
    }

    type Tecnologia {
        tecnologia: String
    }

    input CursoInput {
        tecnologia: String
    }

    type Query {
        obtenerCursos(input: CursoInput!) : [Curso]
        obtenerTecnologias: [Tecnologia]
    }

`;

module.exports = typeDefs;