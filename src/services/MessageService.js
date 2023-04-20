import { getLast,create } from "../dao/mongo/message.mongo.js";

export const getLastService = (quantity) => {
      let messages = [];
      messages = getLast(quantity); 
      return messages;
 
    };

export const postService = (data) => {
      let newMessage = {user:data.user,message:data.message};
      create(newMessage);
    };