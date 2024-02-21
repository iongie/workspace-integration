import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatbotHistory, defaultChatbotHistory } from './chatbot-history.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatbotHistoryService {
  historyChabot =   new BehaviorSubject<ChatbotHistory[]>([]);
  constructor() { }

  getHistoryChatbot = this.historyChabot.asObservable()

  updateHistoryChatbot(newHistoryChatbot: ChatbotHistory[]){
    this.historyChabot.next(newHistoryChatbot)
  }

  clearUserChatbot(){
    this.historyChabot.next(defaultChatbotHistory)
  }
}
