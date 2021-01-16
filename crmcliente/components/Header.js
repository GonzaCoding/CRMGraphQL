import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/router';

const OBTENER_USUARIO = gql`
    query obtenerUsuario {
        obtenerUsuario {
            id
            nombre
            apellido
        }
    }
`;




const Header = () => {

    const { data, loading, error } = useQuery(OBTENER_USUARIO);
    const router = useRouter();

    if(loading) return null;

    if(!data) return router.push('/login');

    const { nombre, apellido } = data.obtenerUsuario;

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        router.push('/login');
    }

    return(
        <div className="flex justify-between mb-6">
            <p className="mr-2">Hola: {nombre} {apellido}</p>

            <button 
                type="button"
                className="bg-blue-800 w-full sm:w-auto font-bolt uppercase text-xs rounded py-1 px-2 text-white shadow-md"
                onClick={ () => cerrarSesion()}
            >
                Cerrar sesión
            </button>
        </div>
    )
}

export default Header;
