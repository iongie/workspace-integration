import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryChatComponent } from './history-chat/history-chat.component';
import { InputChatComponent } from './input-chat/input-chat.component';
import { HeaderChatComponent } from './header-chat/header-chat.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    HistoryChatComponent,
    InputChatComponent,
    HeaderChatComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports:[
    HistoryChatComponent,
    InputChatComponent,
    HeaderChatComponent
  ]
})
export class ComponentsModule { }
