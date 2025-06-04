package com.exam.examportal.controllers;


import com.exam.examportal.models.exam.Question;
import com.exam.examportal.models.exam.Quiz;
import com.exam.examportal.services.QuestionService;
import com.exam.examportal.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(path = "/question")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuizService quizService;

    //add Question
    @PostMapping(path = "/")
    public ResponseEntity<Question> add(@RequestBody Question question){
        return ResponseEntity.ok(this.questionService.addQuestion(question));
    }

    //update Question
    @PutMapping(path = "/")
    public ResponseEntity<Question> update(@RequestBody Question question){
        return ResponseEntity.ok(this.questionService.updateQuestion(question));
    }

    //Get all question of any quiz
    @GetMapping(path = "/quiz/{qid}")
    public ResponseEntity<?> getQuestionsOfQuiz(@PathVariable("qid") Long qid){
//        Quiz quiz = new Quiz();
//        quiz.setqId(qid);
//        Set<Question> questionsOfQuiz =  this.questionService.getQuestionsOfQuiz(quiz);
//        return ResponseEntity.ok(questionsOfQuiz);


        Quiz quiz = this.quizService.getQuiz(qid);
        Set<Question> questions = quiz.getQuestionSet();

        List<Question> list = new ArrayList(questions);

        if (list.size() > Integer.parseInt(quiz.getNoOfQuestions())){
            list = list.subList(0, Integer.parseInt(quiz.getNoOfQuestions()+1));
        }

        list.forEach((q) ->{
            q.setAnswer("");
        });

        Collections.shuffle(list);
        return ResponseEntity.ok(list);
    }

    @GetMapping(path = "/quiz/all/{qid}")
    public ResponseEntity<?> getQuestionsOfQuizAdmin(@PathVariable("qid") Long qid){

        Quiz quiz = new Quiz();
        quiz.setqId(qid);
        Set<Question> questionsOfQuiz =  this.questionService.getQuestionsOfQuiz(quiz);
        return ResponseEntity.ok(questionsOfQuiz);
    }

    //get single question
    @GetMapping(path = "/{quesId}")
    public Question get(@PathVariable("quesId") Long quesId){
        return this.questionService.getQuestion(quesId);
    }

    //Delete question
    @DeleteMapping(path = "/{quesId}")
    public void delete(@PathVariable("quesId") Long quesId){
        this.questionService.deleteQuestion(quesId);
    }


    //Evaluate Quiz
    @PostMapping(path = "/eval-quiz")
    public ResponseEntity<?> evalQuiz(@RequestBody List<Question> questions) {
        Integer marksGot = 0;
        Integer correctAnswers = 0;
        Integer attempted = 0;
        for(Question q: questions){
            Question question = this.questionService.get(q.getQuesId());
            if(question.getAnswer().equals(q.getGivenAnswer())){
                // correct
                correctAnswers++;

                Integer singleMarks = Integer.parseInt(questions.get(0).getQuiz().getMaxMarks()) / questions.size();
                marksGot += singleMarks;
            }
            if(q.getGivenAnswer() != null){
                attempted++;
            }

        }

        Map<String, Integer> map = Map.of("marksGot", marksGot, "correctAnswers",correctAnswers,
                "attempted",attempted);
        return ResponseEntity.ok(map);
    }
}
