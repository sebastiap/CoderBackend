import fs  from 'fs';
import __dirname from '../../../utils.js'

export default class Message {
  constructor(){
    this.path = __dirname+'/data/message.json';

  }

  getLast = async (limit) => {
    try{        
      if (fs.existsSync(this.path)) {
          const data = await fs.promises.readFile(this.path,'utf-8');
          let messages
          if (limit > 0) {
            messages = await JSON.parse(data).slice(limit);
          }
          else {
            messages = await JSON.parse(data);
          }
          console.log("PASE POR ACA", messages)
          
          return messages;
      }
      else {
          console.warn("El archivo no existia al momento de ejecucion.");
          return [];
      }
  }
      catch(error){ 
          console.log("error:" , error); 
  } 
  }
  
  create = async (newMessage) => {
    let allMessages = await this.getLast(0);
    allMessages.push(newMessage);

    await fs.promises.writeFile(this.path,JSON.stringify(allMessages));
    return allMessages;
  }
}


