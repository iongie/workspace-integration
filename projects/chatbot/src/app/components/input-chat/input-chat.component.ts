import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dataPDF, defaultInputChat, defaultdataPDF, fileUpload } from './input-chat.interface';
import { Subject, combineLatest, delay, of, switchMap, takeUntil, tap } from 'rxjs';
import { CallApiService } from '../../services/call-api/call-api.service';
import { ChatbotUserService } from '../../services/chatbot-user/chatbot-user.service';
import { PromptService } from '../../services/prompt/prompt.service';
import { ChatbotHistoryService } from '../../services/chatbot-history/chatbot-history.service';

@Component({
  selector: 'chatbot-input-chat',
  templateUrl: './input-chat.component.html',
  styleUrl: './input-chat.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class InputChatComponent implements OnInit, OnDestroy {
  answer: string = '';
  aiForm!: FormGroup;
  prompt: string | null = null;
  uploadFileAction: boolean = false;
  resultFileUpload: dataPDF = defaultdataPDF;
  destroy: Subject<void> = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private callApi: CallApiService,
    private chatbotUserServ: ChatbotUserService,
    private chatbotHistoryServ: ChatbotHistoryService,
    private promptServ: PromptService
  ) { }

  ngOnInit(): void {
    this.aiForm = this.fb.group({
      prompt: ['', [Validators.required]],
      type: ['text', [Validators.required]]
    })
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async onFileSelected(event: any) {
    combineLatest([
      this.chatbotUserServ.getUserChatbot,
      of(event.target.files[0])
    ])
      .pipe(
        switchMap(([user, fileDescription]) => {
          const uploadFormData = new FormData();
          uploadFormData.append('document', fileDescription);
          return this.callApi.uploadFile('api/upload-file', uploadFormData, user.apiKey!)
        }),
        tap(()=> this.uploadFileAction = true),
        tap((res: any)=> this.aiForm.get('prompt')?.setValue(res.file)),
        tap(()=> this.aiForm.get('type')?.setValue('file')),
        delay(1000),
        takeUntil(this.destroy)
      ).subscribe(
        {
          next: (res: any) => {
            this.resultFileUpload = res;
          },
          error: (e: any) => {
            console.log(e)
          }
        }
      )
  }

  
  answerTheQuestion() {
    this.aiForm.valid &&
    this.chatbotUserServ.getUserChatbot
    .pipe(
      switchMap((user: any) => {
        return combineLatest([
          this.promptServ.getSettingPrompt,
          of(user)
        ])
      }),
      switchMap(([prompt, user]) => {
        return combineLatest([
          this.callApi.getChat('api/assistant', user.apiKey, prompt.userId!, prompt.id!),
          of(prompt),
          of(user)
        ])
      }),
      tap(()=>this.promptServ.updatePrompt(this.aiForm.get('prompt')?.value)),
      tap(([history, prompt, user]: any) => {
        if (history.data.length !== 0) {
          let historyChatbot = history.data.filter((val: any) => val.question == this.aiForm.get('prompt')?.value)
          this.promptServ.updateProcessChatbot(historyChatbot.length === 0 && true)
        } else {
          this.promptServ.updateProcessChatbot(true)
        }
      }),
      switchMap(([history, prompt, user]: any) => {
        // Proses generate AI
        if (history.data.length !== 0) {
          let historyChatbot = history.data.filter((val: any) => val.question == this.aiForm.get('prompt')?.value)
          return historyChatbot.length === 0
            ? combineLatest([this.callApi.postChat('api/assistant', this.aiForm.value, user.apiKey, prompt.userId, prompt.id), of(prompt), of(user)])
            : combineLatest([of(null), of(user)])
        } else { //jika history  kosong
          return combineLatest([this.callApi.postChat('api/assistant', this.aiForm.value, user.apiKey, prompt.userId, prompt.id), of(prompt), of(user)])
        }
      }),
      switchMap(([sendChat, prompt, user]) => this.callApi.getChat('api/assistant', user.apiKey, prompt.userId, prompt.id)),
      tap((res: any) => this.chatbotHistoryServ.updateHistoryChatbot(res.data)),
      tap(() => {
        this.promptServ.updateProcessChatbot(false)
      }),
      tap(()=> this.uploadFileAction = false),
      tap(()=> this.aiForm.reset(defaultInputChat)),
      tap(()=>this.promptServ.updatePrompt("")),
      takeUntil(this.destroy),
    ).subscribe(
      {
        next: (res: any) => {
          console.log('answerTheQuestion', res);
        },
        error: (e: any) => {
          console.log(e);
          this.uploadFileAction = false;
          this.promptServ.updateProcessChatbot(false);
          this.promptServ.updateErrorChatbot(true);
        }
      }
    )
  }
}
