import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import Pedido from '../components/Pedido';

const OBTENER_PEDIDOS = gql`
    query obtenerPedidosVendedor {
        obtenerPedidosVendedor {
            id
            pedido {
                id
                cantidad
                nombre
            }
            cliente {
                id
                nombre
                apellido
                email
                telefono
            }
            vendedor
            total
            estado
        }
    }

`;

const Pedidos = () => {

    const { error, loading, data } = useQuery(OBTENER_PEDIDOS);

    if(loading) return 'Cargando...';

    const { obtenerPedidosVendedor } = data;

    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Pedidos</h1>

            <Link href="/nuevopedido">
                <a className="bg-blue-800 py-2 px-5 mt-3 inline-block text-white hover:bg-gray-800 hover:text-gray-200 mb-3 rounded uppercase font-bold test-sm">
                    Nuevo Pedido
                </a>
            </Link>

            { obtenerPedidosVendedor.length === 0 ? (
                <p className="mt-5 text-center text-2xl">No hay pedidos aún</p>
            ) : (
                obtenerPedidosVendedor.map( pedido => (
                    <Pedido
                        key={pedido.id}
                        pedido={pedido}
                    />
                ))
            )

            }

        </Layout>
    )
}

export default Pedidos;
