import {ticketModel} from '../models/ticket.model.js'

export const create = async (purchase) => {
        try {
            let result =  await ticketModel.create(purchase);
            return result;
            
        } catch (error) {
            return error;
        }
    }

export const getAll = async() => {
        const tickets = await ticketModel.find();
        return tickets;
    }

export const getOne = async(tid) => {
        const searchedTicket = await ticketModel.findOne({"_id":tid});
        return searchedTicket;
    }
export const getByUser = async(user) => {
        const searchedTicket = await ticketModel.find({"purchaser":user});
        return searchedTicket;
    }
  
