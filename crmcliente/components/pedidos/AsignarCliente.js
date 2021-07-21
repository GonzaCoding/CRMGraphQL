import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { gql, useQuery } from '@apollo/client';
import PedidoContext from '../../context/pedidos/PedidoContext';

const OBTENER_CLIENTES_USUARIO = gql`

    query obtenerClientesVendedor {
        obtenerClientesVendedor {
            id
            nombre
            apellido
            empresa
            email
        }
    }

`;

const AsignarCliente = () => {

    const [ cliente, setCliente ] = useState([]);

    const pedidoContext = useContext(PedidoContext);
    const { agregarCliente } = pedidoContext;

    const { data, loading, error } = useQuery(OBTENER_CLIENTES_USUARIO);

    useEffect(() => {
        agregarCliente(cliente);
    }, [cliente]);

    const seleccionarCliente = cliente => {
        setCliente(cliente);
    }

    if(loading) return null;

    const { obtenerClientesVendedor } = data;


    return (
        <>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold">1.- Asigna un Cliente al Pedido </p>
            <Select
                className="mt-3"
                onChange={ cliente => seleccionarCliente(cliente)}
                options={obtenerClientesVendedor}
                getOptionLabel={cliente => cliente.nombre }
                getOptionValue={cliente => cliente.id }
                placeholder="Busque o Seleccione un Cliente"
                noOptionsMessage={()=> "No hay resultados"}
            >

            </Select>
        </>
    )
}

export default AsignarCliente;
