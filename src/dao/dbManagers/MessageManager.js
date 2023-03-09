import { messageModel } from "../models/message.model.js";

export default class messageManager{
    constructor(){

    }

    getLast = () => {
      let messages = [];
      messages = messageModel.find().limit(5).sort({"_id":-1});
      return messages;
 
    }

    post = (data) => {
      let newMessage = {user:data.user,message:data.message};
      messageModel.create(newMessage);
    }


}