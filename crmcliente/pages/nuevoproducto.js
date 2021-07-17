import React from 'react';
import Layout from '../components/Layout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

const NUEVO_PRODUCTO = gql`
    mutation nuevoProducto($input: ProductoInput) {
        nuevoProducto(input: $input) {
            id
            nombre
            existencia
            precio
        }
    }
`;

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

const NuevoProducto = () => {

    const [ nuevoProducto ] = useMutation(NUEVO_PRODUCTO, {
        update(cache, { data: { nuevoProducto }}) {
            const { obtenerProductos } = cache.readQuery({ query: OBTENER_PRODUCTOS });

            cache.writeQuery({
                query: OBTENER_PRODUCTOS,
                data: {
                    obtenerProductos: [...obtenerProductos, nuevoProducto]
                }
            })
        }
    });

    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            nombre: '',
            existencia: '',
            precio: ''
        },
        validationSchema: Yup.object({
            nombre: Yup.string()
                        .required('El nombre del producto es obligatorio'),
            existencia: Yup.number()
                            .required('Agrega la cantidad disponible')
                            .positive('Solo se aceptan valores positivos')
                            .integer('La existencia deben ser numeros enteros'),
            precio: Yup.number()
                        .required('El precio es obligatorio')
                        .positive('Solo se aceptan valores positivos')
        }),
        onSubmit : async valores => {
            
            const {nombre, precio, existencia} = valores;
            
            try {
                const { data } = await nuevoProducto({
                    variables: {
                        input: {
                            nombre,
                            existencia,
                            precio
                        }
                    }
                });

                Swal.fire(
                    'Creado',
                    'Se creó el Producto correctamente',
                    'success'
                );
                router.push('/productos');
            } catch (error) {
                setMensaje(error.message.replace('GraphQL error: ', ''));

                setTimeout( ()=> {
                    setMensaje(null);
                }, 2000);
            }
        }
    });

    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Nuevo producto</h1>

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
                                type="text"
                                placeholder="Nombre producto..."
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
                            <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="existencia">
                                Cantidad Disponible:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="existencia"
                                type="number"
                                placeholder="Existencia..."
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.existencia}
                            />
                        </div>

                        { formik.touched.existencia && formik.errors.existencia &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.existencia}</p>
                            </div>
                        }

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm fond-bold mb-2" htmlFor="precio">
                                Precio:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="precio"
                                type="number"
                                placeholder="Precio..."
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.precio}
                            />
                        </div>

                        { formik.touched.precio && formik.errors.precio &&
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.precio}</p>
                            </div>
                        }

                        <input 
                            type="submit"
                            className="bg-gray-800 w-full mt-5 p-2 text-white rounded font-bold uppercase hover:bg-gray-900"
                            value="Agregar nuevo Producto"
                        />
                    </form>
                </div>
            </div>
        </Layout>
    )
}

export default NuevoProducto;
