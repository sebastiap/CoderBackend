import { messageModel } from "../models/message.model.js";

export const getLast = (limit) => {
      let messages = messageModel.find().limit(limit).sort({"_id":-1});
      return messages;
 
    }

    export const create = (newMessage) => {
      messageModel.create(newMessage);
    }


