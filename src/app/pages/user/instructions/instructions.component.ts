import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent {
  qid;
  quiz;

  constructor(private _route: ActivatedRoute, private _quiz: QuizService, private _router: Router){}

  ngOnInit(): void{
    this.qid = this._route.snapshot.params['qid']
    console.log(this.qid);
    
    this._quiz.getQuiz(this.qid).subscribe(
      (data) =>{
        // console.log(data);
        this.quiz = data;
      },
      (error) =>{
        console.log(error);
      }
    )
  }

  startQuiz(){
    Swal.fire({
      title: 'Do you want to start the quiz',
      showCancelButton: true,
      icon: 'info',
      confirmButtonText: 'Start',
      // cancelButtonText: ''

    }).then((result) =>{
      if(result.isConfirmed){
        this._router.navigate(['/start/' + this.qid]);
      }
    })
  }
}
