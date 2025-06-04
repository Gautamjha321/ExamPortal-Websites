import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-quiz',
  templateUrl: './update-quiz.component.html',
  styleUrls: ['./update-quiz.component.css']
})
export class UpdateQuizComponent {

  qId = 0;
  quiz;
  categories;

  constructor(private _route: ActivatedRoute,
              private _quiz: QuizService,
              private _category: CategoryService,
              private _router: Router){}

  ngOnInit(): void{
    this.qId = this._route.snapshot.params['qid'];
    // alert(this.qId)
    this._quiz.getQuiz(this.qId).subscribe(
      (data) => {
        this.quiz = data;
        console.log(this.quiz);
      },
      (error) => {
        console.log(error);
      }
    )

    this._category.categories().subscribe(
      (data) =>{
        this.categories = data;
        console.log(this.categories);
      },
      (error) => {
        console.log(error);
        alert(error)
      }
    )
  }

  public updateQuiz(){
    // alert("update")
    Swal.fire({
      icon:"info",
      title: "Are you sure you want to update",
      confirmButtonText: "Update",
      showCancelButton: true,
    }).then(
      (result) => {
        if(result.isConfirmed){
          this._quiz.updateQuiz(this.quiz).subscribe(
            (data) => {
              console.log(data);
              Swal.fire('Success', "Quiz hads Updated successfully", 'success').then((e) =>{
                this._router.navigate(['/admin/quizzes'])
              });
              this.quiz = null;
            },
            (error) => {
              console.log(error);
              
            }
          )
        }
      }
    )
    
  }


}
