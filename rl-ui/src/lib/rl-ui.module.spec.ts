import { async, TestBed } from '@angular/core/testing';
import { RlUiModule } from './rl-ui.module';

describe('RlUiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RlUiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RlUiModule).toBeDefined();
  });
});
