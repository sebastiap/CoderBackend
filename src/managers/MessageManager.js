import { messageModel } from "./dao/models/message.model.js";

export default class messageManager{
    constructor(){

    }

    getMessages = () => {

    }

    postMessages = (data) => {
      let newMessage = {user:data.user,message:data.message};
      messageModel.create(newMessage);
    }


}