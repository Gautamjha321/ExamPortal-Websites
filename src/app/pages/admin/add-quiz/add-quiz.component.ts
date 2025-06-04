import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css']
})
export class AddQuizComponent {
  categories = []

  quizData ={
    title: '',
    description:'',
    maxMarks:'',
    noOfQuestions:'',
    active: true,
    category: {
      cId: ''
    }
  }

  constructor(private _cat: CategoryService, private _snack: MatSnackBar, private _quiz: QuizService){

  }

  ngOnInit(): void {
    this._cat.categories().subscribe(
      (data : any) => {
        this.categories = data;
        console.log(this.categories);
        
      },
      (error) =>{
        console.log(error);
        Swal.fire('Error', 'Error in loading data from server', 'error')
        
      }
    )
  }

  public addQuiz(){
    if(this.quizData.title.trim() == '' || this.quizData.title == null){
      this._snack.open('Title is required..!', '', {
        duration: 3000
      })
      return;
    }
    

    this._quiz.addQuiz(this.quizData).subscribe(
      (data: any) => {
        Swal.fire('Success', 'Quiz added successfully', 'success');
        this.quizData ={
          title: '',
          description:'',
          maxMarks:'',
          noOfQuestions:'',
          active: true,
          category: {
            cId: ''
          }
        }
      },
      (error) =>{
        console.log(error);
        Swal.fire('Error', "Error in post data to the server", 'error')
        
      }
    )
  }

}
