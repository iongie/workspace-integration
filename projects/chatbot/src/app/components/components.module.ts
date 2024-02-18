import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryChatComponent } from './history-chat/history-chat.component';
import { InputChatComponent } from './input-chat/input-chat.component';
import { HeaderChatComponent } from './header-chat/header-chat.component';



@NgModule({
  declarations: [
    HistoryChatComponent,
    InputChatComponent,
    HeaderChatComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    HistoryChatComponent,
    InputChatComponent,
    HeaderChatComponent
  ]
})
export class ComponentsModule { }
