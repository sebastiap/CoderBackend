import {create,getAll,getById,getOne,update,updateRole} from '../dao/mongo/user.mongo.js'
import userDTO from './dto/user.dto.js';

export const createService = async (newUser) => {
            let result =  await create(newUser);
            return result;
    }

    export const  getAllService = async() => {
            const searchedUsers = await getAll();
            return searchedUsers;
    }

    export const getByIdService = async(cid) => {
        const searchedUser = await getById(cid);
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
    export const updateRoleService = async(email,role) => {
        const result = await updateRole(email,role);
            return result;
    }

    export const validateService = (suser) => {
        let validator = new userDTO(suser);
        let validatedUser = validator.formatUser();
        return validatedUser;

    }
