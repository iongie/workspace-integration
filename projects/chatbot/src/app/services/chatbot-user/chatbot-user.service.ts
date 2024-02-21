import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatbotUser, defaultChatbotUser } from './chatbot-user.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatbotUserService {
  userChabotState =   new BehaviorSubject<ChatbotUser>(defaultChatbotUser)
  constructor() { }

  getUserChatbot = this.userChabotState.asObservable()

  updateUserChatbot(newUserChatbot: ChatbotUser){
    this.userChabotState.next(newUserChatbot)
  }

  clearUserChatbot(){
    this.userChabotState.next(defaultChatbotUser)
  }
}
