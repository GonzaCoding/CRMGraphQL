import React from 'react';
import Layout from '../components/Layout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { gql, useMutation } from '@apollo/client';
import { Router, useRouter } from 'next/router';
import { route } from 'next/dist/next-server/server/router';

const NUEVO_CLIENTE = gql`

    mutation nuevoCliente($input: ClienteInput) {
        nuevoCliente(input: $input) {
            id
            nombre
            apellido
            email
            telefono
        }
    }

`;

const NuevoCliente = () => {

    const [ nuevoCliente ] = useMutation(NUEVO_CLIENTE);

    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            nombre: '',
            apellido: '',
            empresa: '',
            email: '',
            telefono: '',
        },
        validationSchema: Yup.object({
            nombre: Yup.string()
                        .required('El nombre del cliente es obligatorio'),
            apellido: Yup.string()
                        .required('El apellido del cliente es obligatorio'),
            empresa: Yup.string()
                        .required('La Empresa del cliente es obligatorio'),
            email: Yup.string()
                        .email('Email no válido')
                        .required('El email del cliente es obligatorio'),
        }),
        onSubmit : async valores => {
            
            const {nombre, apellido, empresa, email, telefono} = valores;
            
            try {
                const { data } = await nuevoCliente({
                    variables: {
                        input: {
                            nombre,
                            apellido,
                            empresa,
                            email,
                            telefono
                        }
                    }
                });

                //console.log(data.nuevoCliente);
                router.push('/');
            } catch (error) {
                console.log(error);
            }
        }
    });


    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Nuevo Cliente</h1>

            <div className="flex justify-center mt-5">
                <div className="w-full max-w-lg">
                    <form
                        className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                        onSubmit={formik.handleSubmit}
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
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.nombre}
                            />
                        </div>

                        { formik.touched.nombre && formik.errors.nombre &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.nombre}</p>
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
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.apellido}
                            />
                        </div>

                        { formik.touched.apellido && formik.errors.apellido &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.apellido}</p>
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
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.empresa}
                            />
                        </div>

                        { formik.touched.empresa && formik.errors.empresa &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.empresa}</p>
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
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                        </div>

                        { formik.touched.email && formik.errors.email &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.email}</p>
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
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.telefono}
                            />
                        </div>

                        <input 
                            type="submit"
                            className="bg-gray-800 w-full mt-5 p-2 text-white rounded font-bold uppercase hover:bg-gray-900"
                            value="Registrar Cliente"
                        />
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default NuevoCliente;
