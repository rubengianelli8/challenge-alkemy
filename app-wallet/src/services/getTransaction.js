import { ENDPOINT } from "./ENDPOINT";
import axios from 'axios';

function getTransaction (idTransaction){
    const token = window.localStorage.getItem('token'); //get token
    const credentials={//headers to send token
        headers: {Authorization: `Bearer ${token}`}
    }
    return axios.get(ENDPOINT+'/transactions/one/'+idTransaction, credentials)

    .then(response =>{
        return response.data;
    })
    
}

export default getTransaction