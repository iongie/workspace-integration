import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { EMPTY, Subject, combineLatest, takeUntil, tap } from 'rxjs';
import { ChatPrompt, ChatbotHistory, defaultChatPrompt } from '../../services/chatbot-history/chatbot-history.interface';
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
  prompt: ChatPrompt = defaultChatPrompt;
  name_file: string = "";
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
            this.history = res
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
      tap(([prompt, errorChat, processChat]: any) => {
        // process mengambil nama file saja jika type prompt adalah file
        if (prompt.type === 'file') {
          const url = prompt.prompt
          const filenameWithExtension = url.split('/').pop()?.split('.')[0] || "";
          // const filenameWithoutExtension = filenameWithExtension.substring(filenameWithExtension.indexOf('-') + 1);
          this.name_file = filenameWithExtension
        } else {
          EMPTY
        }
      }),
      takeUntil(this.destroy)
    ).subscribe(
      {
        next: ([prompt, errorChat, processChat]: any) => {
          this.prompt = prompt;
          this.errorChat = errorChat;
          this.processChat = processChat;
          
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
