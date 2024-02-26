import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CallApiService } from './services/call-api/call-api.service';
import { EMPTY, Subject, combineLatest, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { ChatbotUserService } from './services/chatbot-user/chatbot-user.service';
import { ChatbotHistoryService } from './services/chatbot-history/chatbot-history.service';
import { ChatbotHistory, defaultChatPrompt, defaultChatbotHistory } from './services/chatbot-history/chatbot-history.interface';
import { PromptService } from './services/prompt/prompt.service';
import { defaultChatbotUser } from './services/chatbot-user/chatbot-user.interface';

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
  promptSummarizationSurat: string = '';
  prompt: string = '';
  chatbot: boolean = true;
  history: ChatbotHistory[] = [];
  myString: string = "Contoh teks yang ingin Anda sisipkan";
  private destroy: Subject<void> = new Subject<void>();
  constructor(
    private callApi: CallApiService,
    private chatbotUserServ: ChatbotUserService,
    private chatbotHistoryServ: ChatbotHistoryService,
    private promptServ: PromptService
  ) { }

  ngOnInit(): void {
    this.promptType = document.getElementById('chatbot')!.getAttribute('prompt-type')!;
    this.promptUserId = document.getElementById('chatbot')!.getAttribute('prompt-user-id')!;
    this.promptId = document.getElementById('chatbot')!.getAttribute('prompt-id')!;
    this.prompt = document.getElementById('chatbot')!.getAttribute('prompt')!;
    this.promptSummarizationSurat = document.getElementById('chatbot')!.getAttribute('prompt')!;
    this.savePromptToState();
    this.saveUserToState();
    this.viewHistoryChat();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  savePromptToState() {
    this.promptServ.updatePromptSetting({
      type: document.getElementById('chatbot')!.getAttribute('prompt-type')!,
      id: document.getElementById('chatbot')!.getAttribute('prompt-id')!,
      userId: document.getElementById('chatbot')!.getAttribute('prompt-user-id')!
    })

    this.promptServ.updatePrompt({
      prompt: document.getElementById('chatbot')!.getAttribute('prompt')!,
      type: document.getElementById('chatbot')!.getAttribute('prompt-type')!
    });
  }

  saveUserToState() {
    this.callApi.createUser('api/user', { 'user': this.promptUserId })
      .pipe(
        takeUntil(this.destroy)
      ).subscribe(
        {
          next: (res: any) => {
            this.chatbotUserServ.updateUserChatbot(res.message[0])
          },
          error: (e: any) => {
            this.chatbotUserServ.updateUserChatbot(defaultChatbotUser)
          }
        }
      )
  }

  expandAction(NewExpandStatus: boolean) {
    this.expandStatus = NewExpandStatus;
  }

  viewHistoryChat() {
    this.chatbotUserServ.getUserChatbot
      .pipe(
        take(2),
        switchMap((user) => this.callApi.getChat('api/assistant', user.apiKey!, this.promptUserId, this.promptId)),
      ).subscribe(
        {
          next: (res: any) => {
            this.chatbotHistoryServ.updateHistoryChatbot(res.data)
          },
          error: (e: any) => {
            this.chatbotHistoryServ.updateHistoryChatbot(defaultChatbotHistory)
          }
        }
      )
  }

  summarizationSurat() {
    combineLatest([
      this.chatbotUserServ.getUserChatbot,
      of(this.chatbot)
    ]).pipe(
      tap(([user, chatbot]) => {
        // membuka chatbot
        this.chatbot = chatbot ? false : true;
      }),
      switchMap(([user, chatbot]) => {
        // manggil data history dan user api key
        return combineLatest([
          this.callApi.getChat('api/assistant', user.apiKey!, this.promptUserId, this.promptId),
          of(user)
        ])
      }),
      tap(([history, user]: any) => {
        // start process generate ai and enable view loading 
        if (history.data.length !== 0) {
          let historyChatbot = history.data.filter((val: any) => val.question == this.promptSummarizationSurat)
          this.promptServ.updateProcessChatbot(historyChatbot.length === 0 && true)
        } else {
          this.promptServ.updateProcessChatbot(true)
        }
      }),
      switchMap(([history, user]: any) => {
        // Proses generate AI
        if (history.data.length !== 0) {
          //kondisi jika history tidak kosong
          let historyChatbot = history.data.filter((val: any) => val.question == this.promptSummarizationSurat)
          return historyChatbot.length === 0
            ? combineLatest([this.callApi.postChat('api/assistant', { prompt: this.promptSummarizationSurat, type: this.promptType }, user.apiKey, this.promptUserId, this.promptId), of(user)])
            : combineLatest([of(null), of(user)])
        } else {
          //kondisi jika history kosong
          return combineLatest([this.callApi.postChat('api/assistant', { prompt: this.promptSummarizationSurat, type: this.promptType }, user.apiKey, this.promptUserId, this.promptId), of(user)])
        }
      }),
      switchMap(([sendChat, user]: any) => {
        // manggil data history
        return this.callApi.getChat('api/assistant', user.apiKey, this.promptUserId, this.promptId)
      }),
      tap((res: any) => {
        // simpan data history chat
        this.chatbotHistoryServ.updateHistoryChatbot(res.data)
      }),
      tap(() => {
        // stop process generate ai and disable view loading di history component
        this.promptServ.clearProcessChatbot()
      }),
      takeUntil(this.destroy),
    ).subscribe(
      {
        next: (res: any) => {
          // console.log('send-chat', res);
        },
        error: (e: any) => {
          // console.log('summarization surat', e)
          // stop process generate ai and disable view loading  di history component
          this.promptServ.clearProcessChatbot();
          // enable view error di history component
          this.promptServ.updateErrorChatbot(true);
        }
      }
    )
  }

  resendSummarizationSurat(event: boolean) {
    if (!event) {
      this.chatbotUserServ.getUserChatbot
        .pipe(
          tap(() => {
            // disabled view error 
            this.promptServ.updateErrorChatbot(false)
          }),
          switchMap((user: any) => {
            // manggil data history dan user api key
            return combineLatest([
              this.callApi.getChat('api/assistant', user.apiKey, this.promptUserId, this.promptId),
              of(user)
            ])
          }),
          tap(([history, user]: any) => {
            // start process generate ai and enable view loading di history component
            if (history.data.length !== 0) {
              let historyChatbot = history.data.filter((val: any) => val.question == this.promptSummarizationSurat)
              this.promptServ.updateProcessChatbot(historyChatbot.length === 0 && true)
            } else {
              this.promptServ.updateProcessChatbot(true);
            }
          }),
          switchMap(([history, user]: any) => {
            // Proses generate AI
            if (history.data.length !== 0) {
              // kondisi jika history tidak kosong
              let historyChatbot = history.data.filter((val: any) => val.question == this.promptSummarizationSurat)
              return historyChatbot.length === 0
                ? combineLatest([this.callApi.postChat('api/assistant', { prompt: this.promptSummarizationSurat, type: this.promptType }, user.apiKey, this.promptUserId, this.promptId), of(user)])
                : combineLatest([of(null), of(user)])
            } else {
              // kondisi jika history kosong
              return combineLatest([this.callApi.postChat('api/assistant', { prompt: this.promptSummarizationSurat, type: this.promptType }, user.apiKey, this.promptUserId, this.promptId), of(user)])
            }
          }),
          switchMap(([sendChat, user]: any) => {
            // manggil data history
            return this.callApi.getChat('api/assistant', user.apiKey, this.promptUserId, this.promptId)
          }),
          tap((res: any) => {
            // simpan data history chat
            this.chatbotHistoryServ.updateHistoryChatbot(res.data)
          }),
          tap(() => {
            // stop process generate ai and disable view loading di history component
            this.promptServ.clearProcessChatbot()
          }),
          takeUntil(this.destroy),
        ).subscribe(
          {
            next: (res: any) => {
              // console.log('resend-send-chat', res);
            },
            error: (e: any) => {
              // console.log('resend summarization surat', e)
              // stop process generate ai and disable view loading di history component
              this.promptServ.clearProcessChatbot();
              // enable view error di history component
              this.promptServ.updateErrorChatbot(true);
            }
          }
        )
    }
  }
}
