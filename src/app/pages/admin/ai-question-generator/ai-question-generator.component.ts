import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { QuestionService } from 'src/app/services/question.service';
import { GeminiService } from 'src/app/services/gemini.service';
import { Category } from 'src/app/models/category.model';
import { Question } from 'src/app/models/question.model';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ai-question-generator',
  templateUrl: './ai-question-generator.component.html',
  styleUrls: ['./ai-question-generator.component.css']
})
export class AiQuestionGeneratorComponent implements OnInit {
  qId: string;
  qTitle: string;
  categories: Category[] = [];
  generatedQuestions: Question[] = [];
  isGenerating = false;
  apiKeyError: string | null = null;
  savedKeys: string[] = [];
  apiKeySet = false;
  
  // Add dummy mode for testing without API
  dummyMode = false;
  
  questionForm: FormGroup;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _category: CategoryService,
    private _question: QuestionService,
    private _gemini: GeminiService,
    private _snack: MatSnackBar
  ) {
    // Initialize form
    this.questionForm = this._formBuilder.group({
      apiKey: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
      topic: new FormControl('', [Validators.required, Validators.minLength(3)]),
      numberOfQuestions: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(20)])
    });

    // Try to set the saved API key if available
    const savedApiKey = this._gemini.getApiKey();
    if (savedApiKey) {
      this.questionForm.get('apiKey')?.setValue(savedApiKey);
    }
  }

  ngOnInit(): void {
    this.qId = this._route.snapshot.params['qid'];
    this.qTitle = this._route.snapshot.params['title'];
    
    console.log('Quiz ID:', this.qId);
    console.log('Quiz Title:', this.qTitle);
    
    // Check if we're missing required parameters
    if (!this.qId) {
      this._snack.open('Quiz ID is missing. Please go back and try again.', 'Close', {
        duration: 5000,
      });
    }
    
    // Initialize form first
    this.initForm();
    
    // Then load data
    this.loadCategories();
    this.loadSavedApiKeys();
  }

  private initForm(): void {
    this.questionForm = this._formBuilder.group({
      apiKey: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
      topic: new FormControl('', [Validators.required, Validators.minLength(3)]),
      numberOfQuestions: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(20)])
    });
  }

  private loadSavedApiKeys(): void {
    const savedKeysString = localStorage.getItem('gemini_api_keys');
    if (savedKeysString) {
      try {
        this.savedKeys = JSON.parse(savedKeysString);
        
        // Check if there's a current key set
        const currentKey = localStorage.getItem('current_gemini_api_key');
        if (currentKey) {
          this.questionForm.patchValue({ apiKey: currentKey });
          this.apiKeySet = true;
        }
      } catch (error) {
        console.error('Error parsing saved API keys', error);
        // Reset if there's an error
        localStorage.removeItem('gemini_api_keys');
        this.savedKeys = [];
      }
    }
  }

  private saveApiKey(key: string): void {
    // Save as current key
    localStorage.setItem('current_gemini_api_key', key);
    
    // Add to saved keys if not already present
    if (!this.savedKeys.includes(key)) {
      this.savedKeys.push(key);
      // Keep only the most recent 5 keys
      if (this.savedKeys.length > 5) {
        this.savedKeys = this.savedKeys.slice(-5);
      }
      localStorage.setItem('gemini_api_keys', JSON.stringify(this.savedKeys));
    }
  }

  setApiKey(): void {
    const apiKey = this.questionForm.get('apiKey')?.value;
    if (!apiKey) {
      this.apiKeyError = 'API key is required';
      return;
    }
    
    this.saveApiKey(apiKey);
    this.apiKeySet = true;
    this.apiKeyError = null;
    this._snack.open('API Key has been set successfully', 'Close', {
      duration: 3000,
    });
    
    // Set the API key in the service directly
    try {
      this._gemini.setApiKey(apiKey);
    } catch (error) {
      console.error('Error setting API key in service:', error);
    }
  }

  private loadCategories(): void {
    console.log('Loading categories...');
    
    this._category.categories().subscribe({
      next: (data: any) => {
        console.log('Raw categories data:', data);
        
        try {
          // Process categories based on response format
          let categoriesArray: any[] = [];
          
          if (data && Array.isArray(data)) {
            categoriesArray = data;
          } else if (data && typeof data === 'object') {
            if (data.content && Array.isArray(data.content)) {
              categoriesArray = data.content;
            } else if (data.data && Array.isArray(data.data)) {
              categoriesArray = data.data;
            } else {
              // Try to extract values if it's an object with category objects
              const values = Object.values(data);
              if (values.length > 0 && typeof values[0] === 'object') {
                categoriesArray = values;
              }
            }
          }
          
          if (categoriesArray.length === 0) {
            console.warn('No categories found in API response');
            this._snack.open('No categories found. Please create categories first.', 'Close', {
              duration: 3000,
            });
            return;
          }
          
          // Map to standard format for consistency
          this.categories = categoriesArray.map(cat => {
            return {
              cid: cat.cid || cat._id || cat.id || '',
              title: cat.title || cat.name || 'Unnamed Category',
              description: cat.description || ''
            };
          });
          
          console.log('Processed categories:', this.categories);
          
          // Only set default category if the form field is empty
          if (this.categories.length > 0 && !this.questionForm.get('categoryId')?.value) {
            const firstCat = this.categories[0];
            console.log('Setting default category:', firstCat);
            this.questionForm.get('categoryId')?.setValue(firstCat.cid);
          }
        } catch (error) {
          console.error('Error processing categories:', error);
          this._snack.open('Error processing categories', 'Close', {
            duration: 3000,
          });
        }
      },
      error: (error) => {
        console.error('API error loading categories:', error);
        this._snack.open('Error loading categories from server', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  generateQuestions(): void {
    console.log('Generate questions called with form data:', this.questionForm.value);
    
    if (this.questionForm.invalid) {
      const invalidFields = [];
      if (this.questionForm.get('apiKey')?.invalid) invalidFields.push('API Key');
      if (this.questionForm.get('categoryId')?.invalid) invalidFields.push('Category');
      if (this.questionForm.get('topic')?.invalid) invalidFields.push('Topic');
      if (this.questionForm.get('numberOfQuestions')?.invalid) invalidFields.push('Number of Questions');
      
      const message = `Please complete these required fields: ${invalidFields.join(', ')}`;
      this._snack.open(message, 'Close', {duration: 3000});
      return;
    }

    // Check if using dummy mode - for testing without API
    if (this.dummyMode) {
      this.useDummyData();
      return;
    }

    // Regular API path continues
    if (!this.apiKeySet) {
      // Auto-set the API key if it exists in the form
      try {
        const apiKey = this.questionForm.get('apiKey')?.value;
        if (apiKey && apiKey.trim() !== '') {
          this._gemini.setApiKey(apiKey);
          this.apiKeySet = true;
          this.saveApiKey(apiKey);
          this._snack.open('API Key automatically set from form', 'Close', {
            duration: 2000,
          });
        } else {
          this._snack.open('Please set your API key first using the "Set API Key" button', 'Close', {
            duration: 3000,
          });
          return;
        }
      } catch (error) {
        console.error('Error auto-setting API key:', error);
        this._snack.open('Error with API key: ' + (error.message || 'Unknown error'), 'Close', {
          duration: 3000,
        });
        return;
      }
    }

    // Set the API key again just to be sure
    try {
      this._gemini.setApiKey(this.questionForm.value.apiKey);
    } catch (error) {
      console.error('Error setting API key:', error);
      this._snack.open('Error with API key: ' + (error.message || 'Unknown error'), 'Close', {
        duration: 3000,
      });
      return;
    }

    const formData = this.questionForm.value;
    console.log('Starting question generation with:', formData);
    
    // Show loading indicator
    this.isGenerating = true;
    this.apiKeyError = null;

    // Show immediate feedback
    this._snack.open(`Generating ${formData.numberOfQuestions} questions about "${formData.topic}"... Please wait.`, 'OK', {
      duration: 3000,
    });

    // Call Gemini service
    this._gemini.generateMCQs(formData.topic, formData.numberOfQuestions).subscribe({
      next: (response: any) => {
        this.isGenerating = false;
        console.log('Success! Received response from Gemini API:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          this.processGeneratedQuestions(response, formData.categoryId);
        } else {
          console.error('Invalid or empty response format:', response);
          this._snack.open('Invalid response format from AI service', 'Close', {
            duration: 3000,
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isGenerating = false;
        console.error('Error from Gemini API:', error);
        this.handleGenerationError(error);
      }
    });
  }

  private processGeneratedQuestions(questions: any[], categoryId: string): void {
    if (questions.length === 0) {
      this._snack.open('No questions were generated. Please try a different topic.', 'Close', {
        duration: 3000,
      });
      return;
    }

    // Map the generated questions to our Question model
    this.generatedQuestions = questions.map(q => ({
      ...q,
      quiz: { qId: this.qId },
      category: { cid: categoryId },
      isSelected: true
    }));

    console.log('Processed generated questions:', this.generatedQuestions);
    
    this._snack.open(`Successfully generated ${this.generatedQuestions.length} questions!`, 'Close', {
      duration: 3000,
    });
  }

  private handleGenerationError(error: HttpErrorResponse): void {
    console.error('Error generating questions:', error);
    
    let errorMessage = 'Failed to generate questions. Please try again.';
    
    // Extract error message from response if possible
    if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific HTTP error status codes
    if (error.status === 401 || error.status === 403) {
      errorMessage = 'API key is invalid or expired. Please check your API key.';
      this.apiKeyError = errorMessage;
      // Clear the current key since it's invalid
      localStorage.removeItem('current_gemini_api_key');
      this.apiKeySet = false;
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please check your topic or try a different one.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    this._snack.open(errorMessage, 'Close', {
      duration: 5000,
    });
  }

  addAllQuestions(): void {
    const selectedQuestions = this.generatedQuestions.filter(q => q.isSelected);
    
    if (selectedQuestions.length === 0) {
      this._snack.open('No questions selected. Please select at least one question.', 'Close', {
        duration: 3000,
      });
      return;
    }

    Swal.fire({
      title: 'Save Questions',
      text: `Add ${selectedQuestions.length} questions to the quiz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add them!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isGenerating = true;
        
        // Create an array of observables for each question
        const addQuestionRequests = selectedQuestions.map(question => 
          this._question.addQuestion(question)
        );
        
        // Subscribe to all observables at once
        import('rxjs').then(({ forkJoin, of }) => {
          forkJoin(addQuestionRequests).subscribe({
            next: (results) => {
              this.isGenerating = false;
              Swal.fire(
                'Success!',
                `${results.length} questions have been added to the quiz.`,
                'success'
              );
              this.clearQuestions();
            },
            error: (error) => {
              this.isGenerating = false;
              console.error('Error adding questions:', error);
              Swal.fire(
                'Error!',
                'There was an error adding the questions. Please try again.',
                'error'
              );
            }
          });
        });
      }
    });
  }

  addSingleQuestion(question: Question): void {
    this.isGenerating = true;
    
    this._question.addQuestion(question).subscribe({
      next: (result) => {
        this.isGenerating = false;
        this._snack.open('Question added successfully!', 'Close', {
          duration: 3000,
        });
        
        // Remove the added question from the list
        this.generatedQuestions = this.generatedQuestions.filter(q => q !== question);
      },
      error: (error) => {
        this.isGenerating = false;
        console.error('Error adding question:', error);
        this._snack.open('Error adding question. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  clearQuestions(): void {
    Swal.fire({
      title: 'Clear Questions',
      text: 'Are you sure you want to clear all generated questions?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear them!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.generatedQuestions = [];
        this._snack.open('All generated questions have been cleared.', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  selectAll(): void {
    this.generatedQuestions.forEach(q => q.isSelected = true);
  }

  deselectAll(): void {
    this.generatedQuestions.forEach(q => q.isSelected = false);
  }

  navigateToQuestions(): void {
    this._router.navigate(['/admin/view-questions', this.qId, this.qTitle]);
  }

  selectCategory(categoryId: string): void {
    if (!categoryId) return;
    
    console.log('Selecting category:', categoryId);
    const category = this.categories.find(c => c.cid === categoryId);
    
    if (category) {
      this.questionForm.get('categoryId')?.setValue(categoryId);
      this._snack.open(`Selected category: ${category.title}`, 'Close', {
        duration: 1000,
      });
    } else {
      console.error('Category not found with ID:', categoryId);
    }
  }

  getCategoryTitle(categoryId: string): string {
    if (!categoryId) return 'None selected';
    
    const category = this.categories.find(c => c.cid === categoryId);
    return category ? category.title : 'Unknown category';
  }

  // Add method to generate dummy data for testing
  private useDummyData(): void {
    this.isGenerating = true;
    this._snack.open('Generating questions in dummy mode...', 'OK', { duration: 2000 });
    
    // Simulate API delay
    setTimeout(() => {
      const formData = this.questionForm.value;
      const count = formData.numberOfQuestions || 5;
      const dummyQuestions = this.generateDummyQuestions(formData.topic, count);
      
      this.isGenerating = false;
      this.processGeneratedQuestions(dummyQuestions, formData.categoryId);
    }, 2000);
  }
  
  // Generate dummy questions for testing
  private generateDummyQuestions(topic: string, count: number): Question[] {
    const questions: Question[] = [];
    
    for (let i = 1; i <= count; i++) {
      questions.push({
        content: `Sample question ${i} about ${topic}?`,
        option1: `Option A for question ${i}`,
        option2: `Option B for question ${i}`,
        option3: `Option C for question ${i}`,
        option4: `Option D for question ${i}`,
        answer: Math.floor(Math.random() * 4 + 1).toString()
      });
    }
    
    return questions;
  }
} 