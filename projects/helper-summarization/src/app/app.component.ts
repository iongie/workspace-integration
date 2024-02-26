import { Component, OnDestroy } from '@angular/core';
import { Subject, defer, delay, from, of, switchMap, takeUntil, tap } from 'rxjs';
import { CallApiService } from './services/call-api/call-api.service';

@Component({
  selector: 'help-summarization-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  openModal: boolean = false;
  proceesSummarization: boolean = false;
  errorSummarization: boolean = false;
  resultSummarization: string | null = null; 
  copySummarization: boolean = false;
  destroy: Subject<void> = new Subject<void>();
  dataUploadError: any;
  clipboard: boolean = false;
  constructor(
    private callApiServ: CallApiService
  ){}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  modalAction(){
    this.openModal = this.openModal ? false: true; 
  }

  onFileSelected(event: any){
    of(event.target.files[0])
    .pipe(
      tap((res)=>this.dataUploadError = res),
      tap(()=>this.resultSummarization = null),
      tap(()=>this.errorSummarization = false),
      tap(()=>this.proceesSummarization = true),
      switchMap((fileDescription)=>{
        // upload file
        const uploadFormData = new FormData();
        uploadFormData.append('document', fileDescription);
        return this.callApiServ.postSummarization('api/summarization', uploadFormData)
      }),
      // tap((res: any)=>this.callApiServ.postSummarization('api/delete-file', {urlFile: res.prompt})),
      tap(()=>this.proceesSummarization = false),
    ).subscribe(
      {
        next: (res: any) => {
          // tampilkan hasil summary
          this.resultSummarization = res.summary;
        },
        error: (e: any) => {
          this.proceesSummarization = false;
          this.errorSummarization = true;
          console.log(e)
        }
      }
    )
  }

  reloadOnFileSelected(){
    of(this.dataUploadError)
    .pipe(
      tap(()=>this.resultSummarization = null),
      tap(()=>this.errorSummarization = false),
      tap(()=>this.proceesSummarization = true),
      switchMap((fileDescription)=>{
        // upload file
        const uploadFormData = new FormData();
        uploadFormData.append('document', fileDescription);
        return this.callApiServ.postSummarization('api/summarization', uploadFormData)
      }),
      // tap((res: any)=>this.callApiServ.postSummarization('api/delete-file', {urlFile: res.prompt})),
      tap(()=>this.proceesSummarization = false),
    ).subscribe(
      {
        next: (res: any) => {
          // tampilkan hasil summary
          this.resultSummarization = res.summary;
        },
        error: (e: any) => {
          this.proceesSummarization = false;
          this.errorSummarization = true;
          console.log(e)
        }
      }
    )
  }

  writeTextInClipboard() {
    defer(() => {
      return navigator.clipboard.writeText(this.resultSummarization!);
    })
    .pipe(
      tap(()=>this.copySummarization = true),
      delay(1000),
      tap(()=>this.copySummarization = false),
    ).subscribe();
  };
  
}
