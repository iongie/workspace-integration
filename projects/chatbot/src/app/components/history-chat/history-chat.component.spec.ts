import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChatComponent } from './history-chat.component';

describe('HistoryChatComponent', () => {
  let component: HistoryChatComponent;
  let fixture: ComponentFixture<HistoryChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
