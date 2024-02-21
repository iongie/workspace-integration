import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ChatbotHistory } from '../../services/chatbot-history/chatbot-history.interface';
import { ChatbotHistoryService } from '../../services/chatbot-history/chatbot-history.service';
import { PromptService } from '../../services/prompt/prompt.service';

@Component({
  selector: 'chatbot-history-chat',
  templateUrl: './history-chat.component.html',
  styleUrl: './history-chat.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HistoryChatComponent implements OnInit, OnDestroy {
  private destroy: Subject<void> = new Subject<void>();
  history: ChatbotHistory[] = [];
  prompt: string = '';
  processChat: boolean = false;
  errorChat: boolean = false;
  @Output() resendEvent = new EventEmitter<boolean>();
  constructor(
    private chatbotHistoryServ: ChatbotHistoryService,
    private promptServ: PromptService
  ) { }

  ngOnInit(): void {
    this.getHistory();
    this.getSettingPrompt();
  }

  ngOnDestroy(): void {

  }

  getHistory() {
    this.chatbotHistoryServ.getHistoryChatbot
      .pipe(
        takeUntil(this.destroy)
      ).subscribe(
        {
          next: (res: any) => {
            this.history = res.map((res: any) => {
              const url = res.question!
              const filenameWithExtension = url.split('/').pop()?.split('.')[0] || "";
              const filenameWithoutExtension = filenameWithExtension.substring(filenameWithExtension.indexOf('-') + 1);


              return {
                uuid: res.uuid,
                question: res.question,
                answer: res.answer,
                moment: res.moment,
                type: res.type,
                name: filenameWithoutExtension
              }
            })
            console.log('history-chat', this.history);
          },
          error: (e: any) => {
            console.log('error history', e)
          }
        }
      )
  }

  getSettingPrompt() {
    combineLatest([
      this.promptServ.getPrompt,
      this.promptServ.getErrorChatbot,
      this.promptServ.getProcessChatbot
    ]).pipe(
      takeUntil(this.destroy)
    ).subscribe(
      {
        next: ([prompt, errorChat, processChat]: any) => {
          console.log('prompt', prompt);
          console.log('error', errorChat);
          console.log('process', processChat);
          this.prompt = prompt
          this.errorChat = errorChat,
          this.processChat = processChat
        },
        error: (e: any) => {
          console.log(e)
        }
      }
    )
  }

  resend() {
    this.errorChat = false;
    this.resendEvent.emit(false)
  }
}
