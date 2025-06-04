import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import Swal from 'sweetalert2';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FileParserService } from 'src/app/services/file-parser.service';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  public Editor = ClassicEditor;
  qId: string = '';
  qTitle: string = '';
  
  // For manual question entry
  question = {
    quiz: {} as any,
    content: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: '',
  };

  // For file upload
  isDragging = false;
  selectedFile: File | null = null;
  parsedQuestions: any[] = [];
  
  // For editing questions
  showEditModal = false;
  editingQuestion: any = {};
  editingIndex: number = -1;

  constructor(
    private _route: ActivatedRoute, 
    private _question: QuestionService,
    private _fileParser: FileParserService
  ) {}

  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qid'];
    this.qTitle = this._route.snapshot.params['title'];
    this.question.quiz['qId'] = this.qId;
  }

  // Manual form submission
  formSubmit() {
    if (this.question.content.trim() == '' || this.question.content == null) {
      Swal.fire("Error", "Enter All Details", 'error');
      return;
    }
    if (this.question.option1.trim() == '' || this.question.option1 == null) {
      Swal.fire("Error", "Enter atleast 2 Options", 'error');
      return;
    }
    if (this.question.option2.trim() == '' || this.question.option2 == null) {
      Swal.fire("Error", "Enter atleast 2 Options", 'error');
      return;
    }
    if (this.question.answer.trim() == '' || this.question.answer == null) {
      Swal.fire("Error", "Select Answer", 'error');
      return;
    }
    
    this.addQuestionToServer(this.question);
  }

  // File upload methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      this.handleFile(event.target.files[0]);
    }
  }

  handleFile(file: File) {
    // Check file extension instead of relying on MIME type
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
      Swal.fire("Error", "Only CSV and JSON files are supported", 'error');
      return;
    }

    this.selectedFile = file;
    this.parseFile(file);
  }

  parseFile(file: File) {
    const fileReader = new FileReader();
    
    fileReader.onload = () => {
      const content = fileReader.result as string;
      
      try {
        if (file.name.toLowerCase().endsWith('.json')) {
          this.parsedQuestions = this._fileParser.parseJsonFile(content);
        } else {
          this.parsedQuestions = this._fileParser.parseCsvFile(content);
        }
        
        // Add quiz ID to each question
        this.parsedQuestions.forEach(q => {
          q.quiz = { qId: this.qId };
        });
        
        if (this.parsedQuestions.length === 0) {
          Swal.fire("Warning", "No valid questions found in the file", 'warning');
        } else {
          Swal.fire("Success", `${this.parsedQuestions.length} questions found in the file`, 'success');
        }
      } catch (error: any) {
        console.error('Error parsing file:', error);
        Swal.fire("Error", `Failed to parse the file: ${error.message}`, 'error');
      }
    };
    
    fileReader.onerror = () => {
      Swal.fire("Error", "Failed to read the file", 'error');
    };
    
    fileReader.readAsText(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.parsedQuestions = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearParsedQuestions() {
    this.parsedQuestions = [];
  }

  // Question management methods
  addAllQuestions() {
    if (this.parsedQuestions.length === 0) {
      return;
    }
    
    Swal.fire({
      title: 'Add all questions?',
      text: `Are you sure you want to add all ${this.parsedQuestions.length} questions?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, add all',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        let successCount = 0;
        let errorCount = 0;
        let totalQuestions = this.parsedQuestions.length;
        let processedCount = 0;
        
        // Show loading
        Swal.fire({
          title: 'Adding questions...',
          html: 'Please wait...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Process each question
        this.parsedQuestions.forEach((q, index) => {
          setTimeout(() => {
            this._question.addQuestion(q).subscribe(
              (data) => {
                successCount++;
                processedCount++;
                this.updateBatchProgress(processedCount, totalQuestions, successCount, errorCount);
                
                if (processedCount === totalQuestions) {
                  this.finalizeBatchUpload(successCount, errorCount);
                }
              },
              (error) => {
                errorCount++;
                processedCount++;
                console.error('Error adding question:', error);
                
                this.updateBatchProgress(processedCount, totalQuestions, successCount, errorCount);
                
                if (processedCount === totalQuestions) {
                  this.finalizeBatchUpload(successCount, errorCount);
                }
              }
            );
          }, index * 300); // Stagger requests to avoid overwhelming the server
        });
      }
    });
  }

  updateBatchProgress(processed: number, total: number, success: number, errors: number) {
    Swal.update({
      title: 'Adding questions...',
      html: `Progress: ${processed}/${total}<br>Success: ${success} | Errors: ${errors}`
    });
  }

  finalizeBatchUpload(successCount: number, errorCount: number) {
    if (errorCount === 0) {
      Swal.fire(
        'Success!',
        `All ${successCount} questions were added successfully.`,
        'success'
      );
      this.parsedQuestions = [];
      this.selectedFile = null;
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    } else {
      Swal.fire(
        'Completed with errors',
        `Added: ${successCount} questions<br>Failed: ${errorCount} questions`,
        'warning'
      );
    }
  }

  addSingleQuestion(question: any) {
    this._question.addQuestion(question).subscribe(
      (data) => {
        Swal.fire("Success", "Question added successfully", 'success');
        // Remove from parsed questions list
        this.parsedQuestions = this.parsedQuestions.filter(q => q !== question);
      },
      (error) => {
        Swal.fire("Error", "Error adding question", 'error');
        console.error(error);
      }
    );
  }

  removeQuestion(index: number) {
    this.parsedQuestions.splice(index, 1);
  }

  // Edit question methods
  editQuestion(question: any, index: number) {
    this.editingQuestion = { ...question };
    this.editingIndex = index;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingQuestion = {};
    this.editingIndex = -1;
  }

  saveEditedQuestion() {
    if (this.editingIndex >= 0 && this.editingIndex < this.parsedQuestions.length) {
      this.parsedQuestions[this.editingIndex] = { ...this.editingQuestion };
      this.closeEditModal();
    }
  }

  // Helper method to add a question to the server
  private addQuestionToServer(questionData: any) {
    this._question.addQuestion(questionData).subscribe(
      (data) => {
        Swal.fire("Success", "Question added successfully", 'success');
        this.resetForm();
      },
      (error) => {
        Swal.fire("Error", "Error adding question", 'error');
        console.error(error);
      }
    );
  }

  private resetForm() {
    this.question.content = '';
    this.question.option1 = '';
    this.question.option2 = '';
    this.question.option3 = '';
    this.question.option4 = '';
    this.question.answer = '';
  }
}