import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { gql, useMutation, useQuery} from '@apollo/client';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const OBTENER_CLIENTE = gql`
    query obtenerCliente($id:ID!){
        obtenerCliente(id:$id) {
            nombre
            apellido
            empresa
            email
            telefono
        }
    }

`;

const ACTUALIZAR_CLIENTE = gql`
    mutation actualizarCliente($id: ID!, $input: ClienteInput) {
        actualizarCliente(id: $id, input: $input) {
            nombre
            apellido
            empresa
            email
            telefono
        }
    }

`;

const OBTENER_CLIENTES_USUARIO = gql`

    query obtenerClientesVendedor {
        obtenerClientesVendedor {
            nombre
            apellido
            empresa
            email
        }
    }

`;

const EditarCliente = () => {
    
    const router = useRouter();
    const { query: { id } } = router;

    const { data, loading, error } = useQuery (OBTENER_CLIENTE, {
        variables: {
            id
        }
    });

    const [ actualizarCliente ] = useMutation(ACTUALIZAR_CLIENTE, {
        update(cache, { data: { actualizarCliente }}) {
            const { obtenerClientesVendedor } = cache.readQuery({
                query: OBTENER_CLIENTES_USUARIO
            });

            const clientesActualizados = obtenerClientesVendedor.map(cliente=>
                cliente.id === id ? actualizarCliente : cliente    
            );

            cache.writeQuery({
                query: OBTENER_CLIENTES_USUARIO,
                data: {
                    obtenerClientesVendedor: clientesActualizados
                }
            });

            cache.writeQuery({
                query: OBTENER_CLIENTE,
                variables: { id },
                data: {
                    obtenerCliente: actualizarCliente
                }
            });
        }
    });

    const validationSchema = Yup.object({
        nombre: Yup.string()
                    .required('El nombre del cliente es obligatorio'),
        apellido: Yup.string()
                    .required('El apellido del cliente es obligatorio'),
        empresa: Yup.string()
                    .required('La Empresa del cliente es obligatorio'),
        email: Yup.string()
                    .email('Email no válido')
                    .required('El email del cliente es obligatorio'),
    })

    if(loading) return 'Cargando...';

    const { obtenerCliente } = data;

    const actualizarInfoCliente = async valores => {
        const { nombre, apellido, empresa, email, telefono } = valores;

        try {
            const { data } = await actualizarCliente({
                variables: {
                    id,
                    input: {
                        nombre,
                        apellido,
                        empresa,
                        email,
                        telefono
                    }
                }
            });

            Swal.fire("Actualizado!", "El cliente se actualizó correctamente", "success");

            router.push('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Editar Cliente</h1>

            <div className="flex justify-center mt-5">
                <div className="w-full max-w-lg">
                    <Formik
                        validationSchema = {validationSchema}
                        enableReinitialize
                        initialValues = { obtenerCliente }
                        onSubmit = { (values) => {
                            actualizarInfoCliente(values);
                        }}
                    >
                        {props => {
                            //console.log(props);
                            return (
                                <form
                                    className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                                    onSubmit={props.handleSubmit}
                                >
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="nombre">
                                            Nombre:
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="nombre"
                                            type="nombre"
                                            placeholder="Nombre cliente..."
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            value={props.values.nombre}
                                        />
                                    </div>

                                    { props.touched.nombre && props.errors.nombre &&
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.nombre}</p>
                                        </div>
                                    }

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="apellido">
                                            Apellido:
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="apellido"
                                            type="apellido"
                                            placeholder="Apellido cliente..."
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            value={props.values.apellido}
                                        />
                                    </div>

                                    { props.touched.apellido && props.errors.apellido &&
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.apellido}</p>
                                        </div>
                                    } 

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="empresa">
                                            Empresa:
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="empresa"
                                            type="empresa"
                                            placeholder="Empresa cliente..."
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            value={props.values.empresa}
                                        />
                                    </div>

                                    { props.touched.empresa && props.errors.empresa &&
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.empresa}</p>
                                        </div>
                                    } 

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="email">
                                            Email:
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="email"
                                            type="email"
                                            placeholder="Email usuario..."
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            value={props.values.email}
                                        />
                                    </div>

                                    { props.touched.email && props.errors.email &&
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.email}</p>
                                        </div>
                                    }

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="telefono">
                                            Teléfono:
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="telefono"
                                            type="tel"
                                            placeholder="Teléfono usuario..."
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            value={props.values.telefono}
                                        />
                                    </div>

                                    <input 
                                        type="submit"
                                        className="bg-gray-800 w-full mt-5 p-2 text-white rounded font-bold uppercase hover:bg-gray-900"
                                        value="Editar Cliente"
                                    />
                                </form>
                            );
                        }}
                    </Formik>
                </div>
            </div>
        </Layout>
    )   
}

export default EditarCliente;
