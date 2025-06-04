import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quiz-attempts',
  templateUrl: './view-quiz-attempts.component.html',
  styleUrls: ['./view-quiz-attempts.component.css']
})
export class ViewQuizAttemptsComponent implements OnInit {
  qId: number;
  quizTitle: string;
  attempts: any[] = [];

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    this.qId = this.route.snapshot.params['qId'];
    this.quizTitle = this.route.snapshot.params['title'];
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.quizService.getQuizAttempts(this.qId).subscribe(
      (data: any) => {
        this.attempts = data;
      },
      (error) => {
        console.log(error);
        Swal.fire('Error', 'Error loading attempts', 'error');
      }
    );
  }
}