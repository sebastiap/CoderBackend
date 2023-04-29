export default class userDTO {
    constructor(user){
        this.formatted = {"name":user.first_name + " " + user.last_name, "mail": user.email,"age":user.age}
    }
    formatUser= () => this.formatted;
};