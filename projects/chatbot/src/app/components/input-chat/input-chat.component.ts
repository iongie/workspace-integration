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
  errorFileUpload: boolean = false;
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
          // upload file
          const uploadFormData = new FormData();
          uploadFormData.append('document', fileDescription);
          return this.callApi.uploadFile('api/upload-file', uploadFormData, user.apiKey!)
        }),
        delay(1000), // delay 1 detik untuk process berikutnya
        tap(()=> {
          // enable view file yang mau diprosess
          this.uploadFileAction = true
        }),
        tap((res: any)=> {
          // set data prompt form builder
          this.aiForm.get('prompt')?.setValue(res.file)
        }),
        tap(()=> {
           // set data type form builder
          this.aiForm.get('type')?.setValue('file')
        }),
        takeUntil(this.destroy)
      ).subscribe(
        {
          next: (res: any) => {
            // tampilkan hasil upload
            this.resultFileUpload = res;
          },
          error: (e: any) => {
            this.errorFileUpload = true;
            console.log(e)
          }
        }
      )
  }

  
  answerTheQuestion() {
    // proses jika form builder terisi
    this.aiForm.valid &&
    this.chatbotUserServ.getUserChatbot
    .pipe(
      switchMap((user: any) => {
        // manggil data prompt dan user
        return combineLatest([
          this.promptServ.getSettingPrompt,
          of(user)
        ])
      }),
      switchMap(([prompt, user]) => {
        // manggil data history chat, data prompt dan user
        return combineLatest([
          this.callApi.getChat('api/assistant', user.apiKey, prompt.userId!, prompt.id!),
          of(prompt),
          of(user)
        ])
      }),
      tap(()=>{
        // tambah data prompt untuk ditampilkan di history component
        // saat prosess generate berlangsung dari form builder 
        this.promptServ.updatePrompt({
          prompt: this.aiForm.get('prompt')?.value,
          type: this.aiForm.get('type')?.value
        })
      }),
      tap(([history, prompt, user]: any) => {
        // start process generate ai and enable view loading di history component
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
          // kondisi jika history tidak kosong
          let historyChatbot = history.data.filter((val: any) => val.question == this.aiForm.get('prompt')?.value)
          return historyChatbot.length === 0
            ? combineLatest([this.callApi.postChat('api/assistant', this.aiForm.value, user.apiKey, prompt.userId, prompt.id), of(prompt), of(user)])
            : combineLatest([of(null), of(user)])
        } else {
          // kondisi jika history kosong
          return combineLatest([this.callApi.postChat('api/assistant', this.aiForm.value, user.apiKey, prompt.userId, prompt.id), of(prompt), of(user)])
        }
      }),
      switchMap(([sendChat, prompt, user]) => {
        // manggil data history chat dan user
        return combineLatest([this.callApi.getChat('api/assistant', user.apiKey, prompt.userId, prompt.id), of(user)])
      }),
      tap(([sendChat, prompt, user]: any) => {
        // simpan data history chat
        this.chatbotHistoryServ.updateHistoryChatbot(sendChat.data)
      }),
      tap(() => {
        // stop process generate ai and disable view loading di history component
        this.promptServ.updateProcessChatbot(false)
      }),
      tap(([resChat, user]:any)=> {
        // delete thumbnail
        this.callApi.generalPost('api/delete-thumbnail', this.resultFileUpload.thumbnail, user.apiKey)
      }),
      switchMap(([resChat, user]:any)=>{
        // tampilkan history chat
        return  of(resChat)
      }),
      tap(()=> {
        // disable view file
        this.uploadFileAction = false
      }),
      tap(()=> {
        // reset form builder
        this.aiForm.reset(defaultInputChat)
      }),
      tap(()=>{
        // reset prompt
        this.promptServ.clearPrompt()
      }),
      takeUntil(this.destroy),
    ).subscribe(
      {
        next: (res: any) => {
          // console.log('answerTheQuestion', res);
        },
        error: (e: any) => {
          console.log(e);
          // disable view file
          this.uploadFileAction = false;
          // stop process generate ai and disable view loading di history component
          this.promptServ.updateProcessChatbot(false);
          // enable view error di history component
          this.promptServ.updateErrorChatbot(true);
        }
      }
    )
  }
}
