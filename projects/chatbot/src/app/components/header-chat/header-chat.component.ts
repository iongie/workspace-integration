import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'chatbot-header-chat',
  templateUrl: './header-chat.component.html',
  styleUrl: './header-chat.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HeaderChatComponent {
  expandStatus: boolean = true;
  @Output() expand = new EventEmitter<boolean>();


  expandAction(){
    this.expandStatus = this.expandStatus ? false: true;
    this.expand.emit(this.expandStatus)
  }
}
