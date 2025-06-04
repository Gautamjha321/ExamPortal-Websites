import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuizAttemptsComponent } from './view-quiz-attempts.component';

describe('ViewQuizAttemptsComponent', () => {
  let component: ViewQuizAttemptsComponent;
  let fixture: ComponentFixture<ViewQuizAttemptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewQuizAttemptsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewQuizAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
