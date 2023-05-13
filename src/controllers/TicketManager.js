import { create as createService,getAll as getAllService,getByIdService,getByUserService } from "../services/TicketService.js";
export default class TicketManager {
    constructor(path){
        this.idIndex = 0 ;
    }

    create = async (cart) => {
        try {
            let result =  await createService(cart);
            this.idIndex = this.idIndex + 1
            return result;
            
        } catch (error) {
            return error;
        }
    }

    getAll = async() => {
        try {
            const tickets = await getAllService();
            return tickets;
        } catch (error) {
              return error;
        }

    }

    getById = async(cid) => {
        const searchedTicket= await getByIdService(cid);
        if (!searchedTicket || searchedTicket.length == 0) {
            return 'Ticket not found';
          }
        return searchedTicket;
    }

    getByUser = async(user) => {
        const userTickets = await getByUserService(String(user));
        return userTickets;
    }


    
}