import { TestBed } from '@angular/core/testing';

import { ChatbotHistoryService } from './chatbot-history.service';

describe('ChatbotHistoryService', () => {
  let service: ChatbotHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
