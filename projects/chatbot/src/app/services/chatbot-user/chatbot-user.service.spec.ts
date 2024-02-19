import { TestBed } from '@angular/core/testing';

import { ChatbotUserService } from './chatbot-user.service';

describe('ChatbotUserService', () => {
  let service: ChatbotUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
