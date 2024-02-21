import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Prompt, defaultPrompt } from '../../app.interface';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  promptState = new BehaviorSubject<string>("")
  promptSettingState = new BehaviorSubject<Prompt>(defaultPrompt)
  processChatbotState = new BehaviorSubject<boolean>(false);
  errorChatbotState = new BehaviorSubject<boolean>(false);
  constructor() { }

  getPrompt = this.promptState.asObservable()

  updatePrompt(newDataPrompt: string){
    this.promptState.next(newDataPrompt)
  }

  clearPrompt(){
    this.promptState.next("")
  }
  
  getSettingPrompt = this.promptSettingState.asObservable()

  updatePromptSetting(newDataPromptSetting: Prompt){
    this.promptSettingState.next(newDataPromptSetting)
  }

  clearPromptSetting(){
    this.promptSettingState.next(defaultPrompt)
  }

  getProcessChatbot = this.processChatbotState.asObservable()

  updateProcessChatbot(newDataProcessChatbot: boolean){
    this.processChatbotState.next(newDataProcessChatbot)
  }

  clearProcessChatbot(){
    this.processChatbotState.next(false)
  }

  getErrorChatbot = this.errorChatbotState.asObservable()

  updateErrorChatbot(newDataErrorChatbot: boolean){
    this.errorChatbotState.next(newDataErrorChatbot)
  }

  clearErrorChatbot(){
    this.errorChatbotState.next(false)
  }  
}
