require("dotenv").config();
class InstaService {
    constructor() {
      this.instaVerifyToken = process.env.INSTAGRAM_API_VERIFY_TOKEN;
      this.accessToken = process.env.INSTAGRAM_BUSINESS_AT;
      this.igid = process.env.IGID
    }
    verifyInstaApi = (mode, token) => {
      if (mode && token === this.instaVerifyToken) {
        return true;
      }
    }

    getIGSID = async ({from, to})=>{
      return from?.id === this.igid? to.data[0]?.id: from?.id
    }

    getInfo = async({IGSID, isAgent}) =>{
      let data
      if (isAgent){
        data = await fetch(`https://graph.instagram.com/v21.0/${IGSID}?fields=name,username&access_token=${this.accessToken}`)
      }else{
        data = await fetch(`https://graph.instagram.com/v21.0/${IGSID}?fields=name,username,profile_pic&access_token=${this.accessToken}`)
      }
      return data.json()
    }

    getConversations = async ()=>{
      const data = await fetch(`https://graph.instagram.com/v21.0/me/conversations?access_token=${this.accessToken}`)
      return data.json()
    }

    getMessages = async ({conversationId})=>{
      const data = await fetch(`https://graph.instagram.com/v21.0/${conversationId}?fields=messages&access_token=${this.accessToken}`)
      return data.json()
    }

    getMessage = async ({messageId})=>{
      const data = await fetch(`https://graph.instagram.com/v21.0/${messageId}?fields=id,created_time,from,to,message&access_token=${this.accessToken}`)
      return data.json()
    }

    sendMessage = async({IGSID, text, attachment})=>{
      return fetch(`https://graph.instagram.com/v21.0/me/messages`, {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${this.accessToken}`,
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(text && {
          'recipient' : {'id': IGSID},
          'message' : { text }
        } || {
          'recipient' : {'id': IGSID},
          'message' : { attachment }
        })
      }).then(r=>r.json())
    }


}

const instaService = new InstaService();
module.exports = instaService;

