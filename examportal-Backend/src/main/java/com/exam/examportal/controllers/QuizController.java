package com.exam.examportal.controllers;


import com.exam.examportal.models.exam.Category;
import com.exam.examportal.models.exam.Quiz;
import com.exam.examportal.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(path = "/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    //add quiz
    @PostMapping(path = "/")
    public ResponseEntity<Quiz> add(@RequestBody Quiz quiz){
        return ResponseEntity.ok(this.quizService.addQuiz(quiz));
    }

    // update Quiz
    @PutMapping(path = "/")
    public ResponseEntity<Quiz> update(@RequestBody Quiz quiz){
        return ResponseEntity.ok(this.quizService.updateQuiz(quiz));
    }

    //get all quiz

    @GetMapping(path = "/")
    public ResponseEntity<?> quizzes(){
        return ResponseEntity.ok(quizService.getQuizzes());
    }

    //get Quiz
    @GetMapping(path = "/{qid}")
    public Quiz quiz(@PathVariable("qid") Long qid){
        return this.quizService.getQuiz(qid);
    }


    //delete Quiz
    @DeleteMapping(path = "/{qid}")
    public void delete(@PathVariable("qid") Long qid){
        this.quizService.deleteQuiz(qid);
    }

    @GetMapping(path = "/category/{cid}")
    public List<Quiz> getQuizzesOfCategory(@PathVariable("cid") Long cid){
        Category category = new Category();
        category.setcId(cid);
        return this.quizService.getQuizzesOfCategory(category);
    }

    // Get active Quizzes
    @GetMapping(path = "/active")
    public List<Quiz> getActiveQuizzes(){
        return quizService.getActiveQuizzes();
    }

    // Get active Quizzes of Category
    @GetMapping(path = "/category/active/{cid}")
    public List<Quiz> getActiveQuizzes(@PathVariable Long cid){
        Category category = new Category();
        category.setcId(cid);
        return quizService.getActiveQuizzesOfCategory(category);
    }


}
