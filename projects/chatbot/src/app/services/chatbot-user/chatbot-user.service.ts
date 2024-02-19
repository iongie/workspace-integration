import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatbotUser, defaultChatbotUser } from './chatbot-user.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatbotUserService {
  userChabot =   new BehaviorSubject<ChatbotUser>(defaultChatbotUser)
  constructor() { }

  getUserChatbot = this.userChabot.asObservable()

  updateUserChatbot(newUserChatbot: ChatbotUser){
    this.userChabot.next(newUserChatbot)
  }

  clearUserChatbot(){
    this.userChabot.next(defaultChatbotUser)
  }
}
