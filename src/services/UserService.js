import {create,getAll,getById,getOne,update} from '../dao/mongo/user.mongo.js'
import config from '../config/config.js';
import userDTO from './dto/user.dto.js';

export const createService = async (newCart) => {
            let result =  await createModel(newCart);
            return result;
    }

    export const  getAllService = async() => {
            const searchedUsers = await getAllModel();
            return searchedUsers;
    }

    export const getByIdService = async(cid) => {
        const searchedUser = await getOne(cid);
        return searchedUser;
    }

    
    export const getOneService = async(email) => {
    const user = await getOne( email ); 
        return user;
    }

    export const updateService = async(email,user) => {
        const result = await update(email,user);
            return result;
    }

    export const validate = (product) => {
        let validator = new userDTO(product);
        let validatedUser = validator.formatted;
        return validatedUser;

    }
