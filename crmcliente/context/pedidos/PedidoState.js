import React, { useReducer } from 'react';
import PedidoContext from './PedidoContext';
import PedidoReducer from './PedidoReducer';
import { 
    SELECCIONAR_CLIENTE,
    SELECCIONAR_PRODUCTO,
    CANTIDAD_PRODUCTOS,
    ACTUALIZAR_TOTAL
} from '../../types';

const PedidoState = ({children}) => {

    const initialState = {
        cliente: {},
        productos: [],
        total: 0
    };

    const [state, dispatch] = useReducer(PedidoReducer, initialState);

    const agregarCliente = (cliente) => {
        dispatch({
            type: SELECCIONAR_CLIENTE,
            payload: cliente
        });
    };

    const agregarProductos = (productosSeleccionados) => {

        let nuevoState;

        if(state.productos.length > 0 ) {
            // actualizar el state si ya había productos seleccionados, para que mantenga la cantidad, sino la sobreescribe con lo que viene de la BD (no tiene cantidad)
            nuevoState = productosSeleccionados.map(producto=>{
                const nuevoObjeto = state.productos.find(productoState => productoState.id === producto.id);
                return {
                    ...producto,
                    nuevoObjeto
                }
            })
        } else {
            nuevoState = productosSeleccionados;
        }

        dispatch({
            type: SELECCIONAR_PRODUCTO,
            payload: nuevoState
        });
    };

    const cantidadProductos = (nuevoProducto) => {
        dispatch({
            type: CANTIDAD_PRODUCTOS,
            payload: nuevoProducto
        });
    }

    const actualizarTotal = () => {
        dispatch({
            type: ACTUALIZAR_TOTAL
        });
    }

    return(
        <PedidoContext.Provider
            value={{
                productos: state.productos,
                total: state.total,
                cliente: state.cliente,
                agregarCliente,
                agregarProductos,
                cantidadProductos,
                actualizarTotal
            }}
        >
            {children}
        </PedidoContext.Provider>
    );
}

export default PedidoState;