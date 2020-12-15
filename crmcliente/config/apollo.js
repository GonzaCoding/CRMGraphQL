import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';
import fetch from 'node-fetch';
import { setContext } from 'apollo-link-context';

const httpLink = createHttpLink({
    uri: 'http://localhost:4000',
    fetch
});

const authLink = setContext((_, {headers}) => {
    //obtener token
    const token = localStorage.getItem('token');
    
    return {
        ...headers,
        authorization: token ? `Bearer ${token}` : '' 
    }
});


const client = new ApolloClient({
    connectToDevTools: true,
    cache: new InMemoryCache,
    link: authLink.contact( httpLink )
});

export default client;