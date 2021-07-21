import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { gql, useQuery } from '@apollo/client';
import PedidoContext from '../../context/pedidos/PedidoContext';

const OBTENER_PRODUCTOS = gql`

    query obtenerProductos {
        obtenerProductos {
            id
            nombre
            precio
            existencia
        }
    }

`;

const AsignarProductos = () => {

    const [ productos, setProductos ] = useState([]);

    const pedidoContext = useContext(PedidoContext);
    const { agregarProductos } = pedidoContext;

    const { data, loading, error } = useQuery(OBTENER_PRODUCTOS);
    
    useEffect(()=>{
        agregarProductos(productos);
    }, [productos]);

    const seleccionarProducto = producto => {
        setProductos(producto);
    }

    if(loading) return null;

    const { obtenerProductos } = data;

    return (
        <>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold">2.- Selecciona o busca los Productos </p>
            <Select
                className="mt-3"
                isMulti={true}
                onChange={ producto => seleccionarProducto(producto)}
                options={obtenerProductos}
                getOptionLabel={producto => `${producto.nombre} - ${producto.existencia} disponibles`}
                getOptionValue={producto => producto.id }
                placeholder="Busque o Seleccione el Producto"
                noOptionsMessage={()=> "No hay resultados"}
            >

            </Select>
        </>
    )
}

export default AsignarProductos;
