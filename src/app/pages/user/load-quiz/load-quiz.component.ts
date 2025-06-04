import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-load-quiz',
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent implements OnInit {

  catId: any;
  quizzes: any[] = [];
  searchTerm = '';
  
  constructor(private _route: ActivatedRoute, private _quiz: QuizService){}

  ngOnInit(): void{
    
    this._route.params.subscribe((params) => {
      this.catId = params['catId'];
      if(this.catId == 0){
        this._quiz.getActiveQuizzes().subscribe(
          (data: any) =>{
            this.quizzes = data as any[];
            console.log(this.quizzes);
          },
          (error) =>{
            console.log(error);
          }
        )
      }else{
        this._quiz.getActiveQuizzesOfCategory(this.catId).subscribe(
          (data: any) =>{
            this.quizzes = data as any[];
            console.log(this.quizzes);
          },
          (error) =>{
            console.log(error);
          }
        )
      }
    })
  }
}
