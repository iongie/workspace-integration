import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CallApiService } from './services/call-api/call-api.service';
import { EMPTY, Subject, combineLatest, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { ChatbotUserService } from './services/chatbot-user/chatbot-user.service';
import { ChatbotHistoryService } from './services/chatbot-history/chatbot-history.service';
import { ChatbotHistory, defaultChatbotHistory } from './services/chatbot-history/chatbot-history.interface';

@Component({
  selector: 'chatbot-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent implements OnInit, OnDestroy {
  expandStatus: boolean = true;
  promptType: string = '';
  promptUserId: string = '';
  promptId: string = '';
  prompt: string = '';
  chatbot: boolean = true;
  history: ChatbotHistory[] = [];
  myString: string = "Contoh teks yang ingin Anda sisipkan";
  processChat: boolean = false;
  errorChat: boolean = false;
  private destroy: Subject<void> = new Subject<void>();
  constructor(
    private callApi: CallApiService,
    private chatbotUserServ: ChatbotUserService,
    private chatbotHistoryServ: ChatbotHistoryService
  ) { }

  ngOnInit(): void {
    this.promptType = document.getElementById('chatbot')!.getAttribute('prompt-type')!;
    this.promptUserId = document.getElementById('chatbot')!.getAttribute('prompt-user-id')!;
    this.promptId = document.getElementById('chatbot')!.getAttribute('prompt-id')!;
    this.prompt = document.getElementById('chatbot')!.getAttribute('prompt')!;
    this.viewHistoryChat();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  expandAction(NewExpandStatus: boolean) {
    this.expandStatus = NewExpandStatus;
  }

  viewHistoryChat() {
    this.callApi.createUser('api/user', { 'user': this.promptUserId })
      .pipe(
        takeUntil(this.destroy),
        tap((res: any) => this.chatbotUserServ.updateUserChatbot(res)),
        switchMap((user) => this.callApi.getChat('api/assistant', user.message[0].apiKey, this.promptUserId, this.promptId)),
        tap((res: any) => this.chatbotHistoryServ.updateHistoryChatbot(res.data)),
      ).subscribe(
        {
          next: (res: any) => {
            console.log('viewHistoryChat', res);
          },
          error: (e: any) => {
            console.log(e)
          }
        }
      )
  }

  chatWithBot() {
    of(this.chatbot)
      .pipe(
        takeUntil(this.destroy),
        tap((res) => {
          this.chatbot = res ? false : true; // membuka chatbot
        }),
        switchMap(() => this.callApi.createUser('api/user', { 'user': this.promptUserId })), // get api berdasarkan user
        tap((res: any) => this.chatbotUserServ.updateUserChatbot(res)), // kirim data ke Observable user chatbot
        switchMap((user: any) => {
          return combineLatest([
            this.callApi.getChat('api/assistant', user.message[0].apiKey, this.promptUserId, this.promptId),
            of(user)
          ])
        }),// get data history dan user api key
        tap(([history, user]: any) => {
          if (history.data.length !== 0) {
            let historyChatbot = history.data.filter((val: any) => val.question == this.prompt)
            this.processChat = historyChatbot.length === 0 && true
          } else {
            this.processChat = true;
          }
        }),
        switchMap(([history, user]: any) => {
          // Proses generate AI
          if (history.data.length !== 0) {
            let historyChatbot = history.data.filter((val: any) => val.question == this.prompt)
            return historyChatbot.length === 0
              ? combineLatest([this.callApi.postChat('api/assistant', { prompt: this.prompt, type: this.promptType }, user.message[0].apiKey, this.promptUserId, this.promptId), of(user)])
              : combineLatest([of(null), of(user)])
          } else { //jika history  kosong
            return combineLatest([this.callApi.postChat('api/assistant', { prompt: this.prompt, type: this.promptType }, user.message[0].apiKey, this.promptUserId, this.promptId), of(user)])
          }
        }),
        switchMap(([sendChat, user]) => this.callApi.getChat('api/assistant', user.message[0].apiKey, this.promptUserId, this.promptId)),
        tap((res: any) => this.chatbotHistoryServ.updateHistoryChatbot(res.data)),
        tap(() => {
          this.processChat = false;
        }),
      ).subscribe(
        {
          next: (res: any) => {
            console.log('send-chat', res);
          },
          error: (e: any) => {
            console.log(e)
            this.processChat = false;
            this.errorChat = true;
          }
        }
      )
  }

  resend(event: boolean){
    if(!event){
      this.callApi.createUser('api/user', { 'user': this.promptUserId })
      .pipe(
        takeUntil(this.destroy),
        tap((res: any) => this.chatbotUserServ.updateUserChatbot(res)),
        switchMap((user: any) => {
          return combineLatest([
            this.callApi.getChat('api/assistant', user.message[0].apiKey, this.promptUserId, this.promptId),
            of(user)
          ])
        }),
        tap(([history, user]: any) => {
          if (history.data.length !== 0) {
            let historyChatbot = history.data.filter((val: any) => val.question == this.prompt)
            this.processChat = historyChatbot.length === 0 && true
          } else {
            this.processChat = true;
          }
        }),
        switchMap(([history, user]: any) => {
          // Proses generate AI
          if (history.data.length !== 0) {
            let historyChatbot = history.data.filter((val: any) => val.question == this.prompt)
            return historyChatbot.length === 0
              ? combineLatest([this.callApi.postChat('api/assistant', { prompt: this.prompt, type: this.promptType }, user.message[0].apiKey, this.promptUserId, this.promptId), of(user)])
              : combineLatest([of(null), of(user)])
          } else { //jika history  kosong
            return combineLatest([this.callApi.postChat('api/assistant', { prompt: this.prompt, type: this.promptType }, user.message[0].apiKey, this.promptUserId, this.promptId), of(user)])
          }
        }),
        switchMap(([sendChat, user]) => this.callApi.getChat('api/assistant', user.message[0].apiKey, this.promptUserId, this.promptId)),
        tap((res: any) => this.chatbotHistoryServ.updateHistoryChatbot(res.data)),
        tap(() => {
          this.processChat = false;
        }),
      ).subscribe(
        {
          next: (res: any) => {
            console.log('send-chat', res);
          },
          error: (e: any) => {
            console.log(e)
            this.processChat = false;
            this.errorChat = true;
          }
        }
      )
    }
  }
}
