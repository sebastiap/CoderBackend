import { getLast,create } from "../dao/dbManagers/MessageDB.js";

export default class messageManager{
    constructor(){

    }

    getLast5 = () => {
      let messages = [];
      messages = getLast(5);
      return messages;
 
    }

    post = (data) => {
      let newMessage = {user:data.user,message:data.message};
      create(newMessage);
    }


}