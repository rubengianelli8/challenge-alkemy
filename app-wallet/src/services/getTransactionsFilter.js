import { ENDPOINT } from "./ENDPOINT";
import axios from 'axios';

function getTransactionsFilter (path){
    const token = window.localStorage.getItem('token'); //get token
    const credentials={//headers to send token
        headers: {Authorization: `Bearer ${token}`}
    }
    return axios.get(ENDPOINT+'/transactions/'+path, credentials)

    .then(response =>{
        return response.data;
    })
    
}

export default getTransactionsFilter