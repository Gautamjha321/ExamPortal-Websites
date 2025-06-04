import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private _http: HttpClient) { }

  public quizzes(){
    return this._http.get(`${baseUrl}/quiz/`);
  }

  public addQuiz(quiz){
    return this._http.post(`${baseUrl}/quiz/`, quiz)
  }

  public deleteQuiz(qId){
    return this._http.delete(`${baseUrl}/quiz/${qId}`, qId);
  }

  public getQuiz(qid){
    return this._http.get(`${baseUrl}/quiz/${qid}`);
  }

  public updateQuiz(quiz){
    return this._http.put(`${baseUrl}/quiz/`, quiz)
  }

  // get Quizzes of category
  public getQuizzesOfCategory(cid){
    return this._http.get(`${baseUrl}/quiz/category/${cid}`)
  }

  //get Active Quizzes
  public getActiveQuizzes(){
    return this._http.get(`${baseUrl}/quiz/active`);
  }

  //get Active Quizzes of Category
  public getActiveQuizzesOfCategory(cid){
    return this._http.get(`${baseUrl}/quiz/category/active/${cid}`);
  }

  // New method to fetch quiz attempts
  public getQuizAttempts(qId: number) {
    return this._http.get(`${baseUrl}/quiz/${qId}/attempts`);
  }
}