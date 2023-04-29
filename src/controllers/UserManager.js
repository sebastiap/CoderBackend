import { createService,getAllService,getOneService,getByIdService,updateService,validateService } from "../services/UserService.js";
import config from "../config/config.js"
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

    // clasify = (user) => {
    //     let role = "User";
    //     let adminrole = this.isAdmin(user);
    //     if (adminrole) {role = adminrole}
    //     return role;
    // }

    isAdmin = (username,password) => {
        let role = "User";
        if (username.slice(0,5) === 'admin'){
            role = 'admin';
        }
        else if (username === config.adminName  && password === config.adminPassword)
        {
            role = 'superadmin';
        }
        return role;
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
    validate = (suser) => {
            const uuser =  validateService( suser ); 
                return uuser;
            }

    
}