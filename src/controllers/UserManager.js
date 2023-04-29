import { createService,getAllService,getOneService,getByIdService,updateService } from "../services/UserService.js";
export default class UserManager {
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
            const users = await getAllService();
            return users;
        } catch (error) {
              return error;
        }

    }

    getById = async(cid) => {
        const searchedUser= await getByIdService(cid);
        if (!searchedUser || searchedUser.length == 0) {
            return 'User not found';
          }
        return searchedTicket;
    }

    getOne = async(email) => {
        const user = await getOneService( email ); 
            return user;
        }
    update = async(email,user) => {
            const uuser = await updateService( email,user ); 
                return uuser;
            }

    
}