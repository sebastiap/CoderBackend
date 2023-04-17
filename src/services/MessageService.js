import { getLast,create } from "../dao/dbManagers/MessageDB.js";

export default class messageManager{
    constructor(){

    }

    getLast5Service = () => {
      let messages = [];
      messages = getLast(5);
      return messages;
 
    }

    postService = (data) => {
      let newMessage = {user:data.user,message:data.message};
      create(newMessage);
    }


}