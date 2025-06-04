import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quiz-questions',
  templateUrl: './view-quiz-questions.component.html',
  styleUrls: ['./view-quiz-questions.component.css']
})
export class ViewQuizQuestionsComponent {
  qId;
  qTitle;
  questions = [];

  constructor(private _route: ActivatedRoute, private _question: QuestionService) {}

  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qid'];
    this.qTitle = this._route.snapshot.params['title'];
    console.log(this.qId);
    console.log(this.qTitle);

    this._question.getQuestionsOfQuiz(this.qId).subscribe(
      (data: any) => {
        console.log(data);
        this.questions = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Delete question with enhanced SweetAlert2 popup
  public deleteQuestion(questionId) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      backdrop: `
        rgba(0, 0, 0, 0.8)
        url('https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif')
        center top
        no-repeat
      `,
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this._question.deleteQuestion(questionId).subscribe(
          (data) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The question has been removed.',
              icon: 'success',
              background: 'rgba(0, 0, 0, 0.15)',
              color: '#fff',
              customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-btn'
              }
            });

            this.questions = this.questions.filter((q) => q.quesId != questionId);
          },
          (error) => {
            console.log(error);
            Swal.fire({
              title: 'Error!',
              text: 'There was an issue deleting the question.',
              icon: 'error',
              
              color: '#fff',
              customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-btn'
              }
            });
          }
        );
      }
    });
  }
}
