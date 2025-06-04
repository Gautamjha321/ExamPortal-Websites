import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit, OnDestroy {

  @ViewChild('cameraFeed', { static: false }) cameraFeed!: ElementRef<HTMLVideoElement>;

  qid: any;
  questions: any[] = [];
  currentQuestionIndex = 0;
  marksGot = 0;
  correctAnswers = 0;
  attempted = 0;
  isSubmitted = false;
  timer: any;
  warningCount = 0;
  maxWarnings = 5;
  isCameraOn = false;
  mediaStream: MediaStream | null = null;

  constructor(
    private _location: LocationStrategy,
    private _route: ActivatedRoute,
    private _question: QuestionService
  ) { }

  ngOnInit(): void {
    this.preventBackButton();
    this.qid = this._route.snapshot.params['qid'];
    this.loadQuestion();
    this.startCamera();
    this.detectTabSwitch();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  loadQuestion() {
    this._question.getQuestionsOfQuizForTest(this.qid).subscribe(
      (data: any) => {
        this.questions = data;
        this.timer = this.questions.length * 2 * 60;
        this.startTimer();
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Error in loading Questions',
          icon: 'error',
          iconColor: '#f44336',
          confirmButtonText: 'OK',
          confirmButtonColor: '#6a11cb',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button',
          },
          background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
        });
      }
    );
  }

  preventBackButton() {
    history.pushState(null, null, location.href);
    this._location.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.isCameraOn = true;
        // Bind the camera feed to the video element
        if (this.cameraFeed && this.cameraFeed.nativeElement) {
          this.cameraFeed.nativeElement.srcObject = stream;
        }
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Camera access denied. Please allow camera access to proceed.',
          icon: 'error',
          iconColor: '#f44336',
          confirmButtonText: 'OK',
          confirmButtonColor: '#6a11cb',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button',
          },
          background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
        });
      });
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.isCameraOn = false;
      // Clear the video element
      if (this.cameraFeed && this.cameraFeed.nativeElement) {
        this.cameraFeed.nativeElement.srcObject = null;
      }
    }
  }

  detectTabSwitch() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.warningCount++;
        if (this.warningCount > this.maxWarnings) {
          this.evalQuiz();
          Swal.fire({
            title: 'Warning!',
            text: 'You have exceeded the maximum number of tab switches. Quiz submitted!',
            icon: 'warning',
            iconColor: '#FF9800',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6a11cb',
            customClass: {
              popup: 'custom-swal-popup',
              title: 'custom-swal-title',
              confirmButton: 'custom-swal-confirm-button',
            },
            background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
          });
        } else {
          Swal.fire({
            title: 'Warning!',
            text: `Do not switch tabs! Warnings left: ${this.maxWarnings - this.warningCount}`,
            icon: 'warning',
            iconColor: '#FF9800',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6a11cb',
            customClass: {
              popup: 'custom-swal-popup',
              title: 'custom-swal-title',
              confirmButton: 'custom-swal-confirm-button',
            },
            background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
          });
        }
      }
    });
  }

  submitQuiz() {
    Swal.fire({
      title: 'Are you sure you want to submit?',
      text: 'You will not be able to go back after submitting!',
      icon: 'question',
      iconColor: '#6a11cb',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#6a11cb',
      cancelButtonColor: '#f44336',
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
      },
      background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
    }).then((result) => {
      if (result.isConfirmed) {
        this.evalQuiz();
      }
    });
  }

  startTimer() {
    let t = window.setInterval(() => {
      if (this.timer <= 0) {
        this.evalQuiz();
        clearInterval(t);
      } else {
        this.timer--;
      }
    }, 1000);
  }

  getFormattedTime() {
    let mm = Math.floor(this.timer / 60);
    let ss = this.timer - mm * 60;
    return `${mm} min: ${ss} sec`;
  }

  evalQuiz() {
    this.isSubmitted = true;
    this.stopCamera();

    this._question.evalQuiz(this.questions).subscribe(
      (data: any) => {
        this.marksGot = parseFloat(Number(data.marksGot).toFixed(2));
        this.correctAnswers = data.correctAnswers;
        this.attempted = data.attempted;

        // Update the questions array with correct answers from the server
        if (data.questions) {
          this.questions = data.questions.map((serverQuestion: any) => {
            const localQuestion = this.questions.find(q => q.quesId === serverQuestion.quesId);
            if (localQuestion) {
              return { ...localQuestion, answer: serverQuestion.answer };
            }
            return serverQuestion;
          });
        }

        // Show result pop-up
        Swal.fire({
          title: 'Quiz Submitted!',
          html: `
            <div class="result-popup">
              <div class="result-item">
                <span class="result-label">Marks Obtained:</span>
                <span class="result-value">${this.marksGot}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Correct Answers:</span>
                <span class="result-value">${this.correctAnswers}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Attempted:</span>
                <span class="result-value">${this.attempted}</span>
              </div>
            </div>
          `,
          icon: 'success',
          iconColor: '#4CAF50',
          confirmButtonText: 'OK',
          confirmButtonColor: '#6a11cb',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button',
          },
          background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
        });
      },
      (error) => {
        console.log(error);
        Swal.fire({
          title: 'Error!',
          text: 'Error evaluating quiz',
          icon: 'error',
          iconColor: '#f44336',
          confirmButtonText: 'OK',
          confirmButtonColor: '#6a11cb',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button',
          },
          background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f1f9 100%)',
        });
      }
    );
  }

  printPage() {
    window.print();
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
}