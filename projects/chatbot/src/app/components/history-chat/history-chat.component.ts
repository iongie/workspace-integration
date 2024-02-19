import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ChatbotHistory } from '../../services/chatbot-history/chatbot-history.interface';
import { ChatbotHistoryService } from '../../services/chatbot-history/chatbot-history.service';

@Component({
  selector: 'chatbot-history-chat',
  templateUrl: './history-chat.component.html',
  styleUrl: './history-chat.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HistoryChatComponent implements OnInit, OnDestroy {
  private destroy: Subject<void> = new Subject<void>();
  history: ChatbotHistory[] = [];
  @Input() promptType: string = '';
  @Input() promptId: string = '';
  @Input() promptUserId: string = '';
  @Input() prompt: string = '';
  @Input() processChat: boolean = false;
  @Input() errorChat: boolean = false;
  @Output() resendEvent = new EventEmitter<boolean>(); 
  constructor(
    private chatbotHistoryServ: ChatbotHistoryService
  ) { }

  ngOnInit(): void {
    console.log('prompt ID', this.promptId);
    console.log('prompt Type', this.promptType)
    console.log('prompt User ID', this.promptUserId)
    console.log('prompt', this.prompt)
    console.log('proses CHAT', this.processChat)
    console.log('error CHAT', this.errorChat)
    
    this.chatbotHistoryServ.getHistoryChatbot
    .pipe(
      takeUntil(this.destroy)
    ).subscribe(
      {
        next: (res: any) => {
          this.history = res
          console.log('history-chat', this.history);
        },
        error: (e: any) => {
          console.log('error history', e)
        }
      }
    )

  }

  ngOnDestroy(): void {

  }

  resend(){
    this.errorChat = false;
    this.resendEvent.emit(false)
  }
}
