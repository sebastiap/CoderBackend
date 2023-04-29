// import {ticketModel} from '../models/ticket.model.js'
import {userModel} from '../models/user.model.js'

export const create = async (newUser) => {
        try {
            const result = await userModel.create(newUser);
            return result;
            
        } catch (error) {
            return error;
        }
    }

export const getAll = async() => {
        const users = await userModel.find();
        return users;
    }

export const getOne = async(email) => {
    const user = await userModel.findOne({ email }); 
        return user;
    }
export const getById = async(id) => {
    const user = await userModel.findById(id);
        return user;
    }

export const update = async(email,user) => {
        const result = await userModel.updateOne({email},user);
            return result;
    }
  
