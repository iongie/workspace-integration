import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'chatbot-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent {
  title = 'chatbot';
  expandStatus: boolean = false;
  expandAction(NewExpandStatus: boolean){
    this.expandStatus = NewExpandStatus;    
  }
}
