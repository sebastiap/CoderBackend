import {postService,getLastService} from "../services/MessageService.js"

export default class messageManager{
    constructor(){

    }

    getLast5 = () => {
      let messages = getLastService(5);
      return messages;
 
    }

    post = (data) => {
      postService(data);
    }


}