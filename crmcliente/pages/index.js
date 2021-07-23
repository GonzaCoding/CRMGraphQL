import Layout from '../components/Layout';
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Cliente from '../components/Cliente';

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


const Home = () => {

    const { data, loading, error } = useQuery(OBTENER_CLIENTES_USUARIO);
    const router = useRouter();

    if(loading) return 'Cargando...';

    if(!data) return router.push('/login');

    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Clientes</h1>
            <Link href="/nuevocliente">
                <a className="bg-blue-800 py-2 px-5 mt-3 inline-block text-white hover:bg-gray-800 hover:text-gray-200 mb-3 rounded uppercase font-bold test-sm w-full lg:w-auto text-center">
                    Nuevo Cliente
                </a>
            </Link>

            <div className="overflow-x-scroll">
                <table className="table-auto shadow-md mt-10 w-full w-lg ">
                    <thead className="bg-gray-800">
                        <tr className="text-white">
                            <th className="w-1/5 py-2">Nombre</th>
                            <th className="w-1/5 py-2">Empresa</th>
                            <th className="w-1/5 py-2">Email</th>
                            <th className="w-1/5 py-2">Eliminar</th>
                            <th className="w-1/5 py-2">Editar</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {
                            data.obtenerClientesVendedor.map( cliente => (
                                <Cliente 
                                    key={cliente.id}
                                    cliente={cliente}
                                />
                            ))
                        }
                    </tbody>
                </table>
            </div>
            
        </Layout>
    )
}

export default Home;