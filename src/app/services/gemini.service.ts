import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey: string = '';
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private proxyUrl: string = '/api/gemini-proxy'; // Add proxy option for avoiding CORS
  private useProxy: boolean = false; // Set to true if you want to use proxy

  constructor(private _http: HttpClient) {
    // Try to load saved API key on initialization
    const savedKey = localStorage.getItem('current_gemini_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
    }
    
    // Check if we should use proxy based on environment
    this.checkEnvironment();
  }
  
  private checkEnvironment() {
    // For simplicity, we'll always use the proxy
    this.useProxy = true;
    
    // Just for logging
    const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
    const isSecure = window.location.protocol === 'https:';
    
    console.log('Gemini API configuration:', {
      useProxy: this.useProxy,
      isLocalhost,
      isSecure,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0
    });
  }

  setApiKey(key: string): void {
    if (!key || key.trim() === '') {
      throw new Error('API key cannot be empty');
    }
    this.apiKey = key.trim();
    // Save the API key to localStorage
    localStorage.setItem('current_gemini_api_key', this.apiKey);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  generateMCQs(topic: string, count: number = 5): Observable<any[]> {
    console.log(`Generating MCQs for topic: ${topic}, count: ${count}`);
    
    if (!this.apiKey) {
      console.error('API key not set');
      return throwError(() => new Error('API key not set. Please set an API key before generating questions.'));
    }

    if (!topic || topic.trim() === '') {
      console.error('Topic is empty');
      return throwError(() => new Error('Topic cannot be empty'));
    }

    // Decide which URL to use based on configuration
    let url: string;
    
    if (this.useProxy) {
      // Use our backend proxy to avoid CORS issues
      url = this.proxyUrl;
      console.log('Using proxy URL for Gemini API:', url);
    } else {
      // Direct API access
      url = `${this.baseUrl}?key=${this.apiKey}`;
      console.log('Using direct Gemini API URL');
    }
    
    // Create a clearer prompt for the Gemini API with better JSON structure
    const prompt = `Generate ${count} multiple-choice questions about ${topic}.

INSTRUCTIONS:
1. Create exactly ${count} questions about ${topic}
2. Each question must have 4 options
3. Provide only ONE correct answer per question
4. Format your final response ONLY as a valid JSON array with this exact structure:

[
  {
    "content": "First question text here",
    "option1": "Option A text",
    "option2": "Option B text",
    "option3": "Option C text",
    "option4": "Option D text",
    "answer": "1"
  },
  {
    "content": "Second question text here",
    "option1": "Option A text",
    "option2": "Option B text",
    "option3": "Option C text", 
    "option4": "Option D text",
    "answer": "3"
  }
]

IMPORTANT NOTES:
- For the "answer" field, use ONLY the number (1, 2, 3, or 4) corresponding to the correct option
- Ensure the JSON structure is valid with proper quotes and commas
- Do NOT include any text before or after the JSON array
- Do NOT use markdown code blocks, just the raw JSON array`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
        responseFormat: { type: "JSON" }
      }
    };

    // Create headers based on whether we're using proxy or direct API
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    
    // Add API key as header if using proxy
    if (this.useProxy) {
      headers = headers.set('X-Gemini-API-Key', this.apiKey);
    }

    console.log('Sending request to Gemini API...');
    
    // Add specific error handling for common Gemini API issues
    return this._http.post(url, body, { headers })
      .pipe(
        map((response: any) => {
          console.log('Received raw response from Gemini API');
          
          // If using proxy, the response might be directly the questions array
          if (this.useProxy && Array.isArray(response)) {
            console.log('Received direct array from proxy');
            return this.validateQuestions(response);
          }
          
          try {
            if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
              console.error('Unexpected response structure:', response);
              throw new Error('Unexpected response structure from Gemini API');
            }
            
            const text = response.candidates[0].content.parts[0].text;
            console.log('Response length:', text.length);
            console.log('Raw response text:', text);
            
            // Improved JSON parsing strategies
            
            // Strategy 1: Direct parsing - look for valid JSON array
            try {
              // Clean up potential text before/after JSON
              let cleanedText = text.trim();
              
              // Remove any markdown code block indicators
              cleanedText = cleanedText.replace(/```json|```/g, '').trim();
              
              // Try to find the first [ and last ] to extract just the JSON array
              const firstBracket = cleanedText.indexOf('[');
              const lastBracket = cleanedText.lastIndexOf(']');
              
              if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                const jsonText = cleanedText.substring(firstBracket, lastBracket + 1);
                try {
                  const parsedQuestions = JSON.parse(jsonText);
                  if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                    console.log('Successfully parsed clean JSON array');
                    return this.validateQuestions(parsedQuestions);
                  }
                } catch (e) {
                  console.warn('Clean JSON parsing failed:', e);
                }
              }
            } catch (e) {
              console.warn('Direct JSON parsing failed:', e);
            }
            
            // Strategy 2: Look for JSON array with regex
            try {
              const jsonMatches = text.match(/\[\s*\{\s*"content"[\s\S]*?\}\s*\]/g);
              if (jsonMatches && jsonMatches.length > 0) {
                const parsedQuestions = JSON.parse(jsonMatches[0]);
                if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                  console.log('Successfully parsed JSON array from response using regex');
                  return this.validateQuestions(parsedQuestions);
                }
              }
            } catch (e) {
              console.warn('JSON regex parsing failed:', e);
            }
            
            // Strategy 3: Try to find individual JSON objects
            try {
              const objMatches = text.match(/\{\s*"content[\s\S]*?\}/g);
              if (objMatches && objMatches.length > 0) {
                const parsedObjects = objMatches.map(match => {
                  try {
                    return JSON.parse(match);
                  } catch (e) {
                    return null;
                  }
                }).filter(q => q !== null);
                
                if (parsedObjects.length > 0) {
                  console.log('Successfully parsed individual JSON objects');
                  return this.validateQuestions(parsedObjects);
                }
              }
            } catch (e) {
              console.warn('Individual JSON object parsing failed:', e);
            }
            
            // Strategy 4: Try manual text extraction as last resort
            try {
              const questions = this.extractQuestionsFromText(text);
              if (questions.length > 0) {
                console.log('Successfully extracted questions from text');
                return this.validateQuestions(questions);
              }
            } catch (e) {
              console.warn('Manual text extraction failed:', e);
            }
            
            throw new Error('Could not parse questions from response. Please try a different topic or prompt.');
          } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Failed to parse questions from response: ' + error.message);
          }
        }),
        catchError(error => {
          console.error('Gemini API error:', error);
          
          // If using proxy and it failed, try direct API as fallback
          if (this.useProxy) {
            console.log('Proxy API call failed, trying direct API call as fallback...');
            // Switch to direct API temporarily for this request
            this.useProxy = false;
            
            // Make direct API call
            const directResult = this.generateMCQs(topic, count);
            
            // Reset useProxy to true for future calls
            this.useProxy = true;
            
            return directResult;
          }
          
          let errorMessage = 'Failed to connect to Gemini API.';
          
          if (error.error && error.error.error) {
            const apiError = error.error.error;
            errorMessage = `${apiError.status || 'ERROR'}: ${apiError.message || 'Unknown API error'}`;
            
            if (apiError.status === 'PERMISSION_DENIED') {
              errorMessage = 'PERMISSION_DENIED: API key not authorized. Please check your API key or create a new one in the Google AI Studio.';
            } else if (apiError.status === 'INVALID_ARGUMENT') {
              errorMessage = 'INVALID_ARGUMENT: ' + apiError.message;
            } else if (apiError.status === 'RESOURCE_EXHAUSTED') {
              errorMessage = 'RESOURCE_EXHAUSTED: API quota exceeded. Please try again later or use a different API key.';
            }
          } else if (error.status === 0) {
            errorMessage = 'Network error: Cannot connect to Gemini API. Please check your internet connection.';
          } else if (error.status) {
            errorMessage = `HTTP Error ${error.status}: ${error.statusText || 'Unknown error'}`;
          }
          
          console.error('Formatted error message:', errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  private extractQuestionsFromText(text: string): any[] {
    const result = [];
    console.log('Attempting manual text extraction from:', text.substring(0, 100) + '...');
    
    // First try to detect questions by common patterns
    const questionPatterns = [
      // Pattern: "Question: content Options: A) opt1 B) opt2 C) opt3 D) opt4 Answer: X"
      /(?:Question:|Q\d+:|^\d+[\.\)])([\s\S]*?)(?:Options:|A\))([\s\S]*?)(?:Answer:)([\s\S]*?)(?=(?:Question:|Q\d+:|^\d+[\.\)]|$))/gim,
      
      // Pattern: "content A) opt1 B) opt2 C) opt3 D) opt4 Answer: X"
      /([\s\S]*?)A\)([\s\S]*?)B\)([\s\S]*?)C\)([\s\S]*?)D\)([\s\S]*?)(?:Answer:|Correct Answer:)([\s\S]*?)(?=(?:Question:|Q\d+:|^\d+[\.\)]|$))/gim
    ];
    
    for (const pattern of questionPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        console.log(`Found ${matches.length} questions using pattern`);
        
        for (const match of matches) {
          try {
            // Extract question content (first capture group)
            const content = match[1]?.trim() || '';
            
            // Extract options
            let options = [];
            
            if (match[2]) {
              // For first pattern: options are in one group, need to split by A), B), etc.
              const optionsText = match[2];
              const optionMatches = optionsText.match(/[A-D]\)[\s\S]*?(?=[A-D]\)|Answer:|$)/g);
              
              if (optionMatches) {
                for (let i = 0; i < Math.min(optionMatches.length, 4); i++) {
                  const option = optionMatches[i].replace(/^[A-D]\)/, '').trim();
                  options.push(option);
                }
              }
            } else if (match[2] && match[3] && match[4] && match[5]) {
              // For second pattern: each option has its own capture group
              options = [
                match[2]?.trim() || '',
                match[3]?.trim() || '',
                match[4]?.trim() || '',
                match[5]?.trim() || ''
              ];
            }
            
            // While we should have 4 options, check and pad if needed
            while (options.length < 4) {
              options.push(`Option ${options.length + 1}`);
            }
            
            // Extract answer
            const answerText = match[match.length - 1]?.trim() || '';
            let answer = '1'; // Default to first option
            
            // Try to find letter (A, B, C, D) or number (1, 2, 3, 4)
            const letterMatch = answerText.match(/[A-Da-d]/);
            const numberMatch = answerText.match(/[1-4]/);
            
            if (letterMatch) {
              // Convert A,B,C,D to 1,2,3,4
              const answerLetter = letterMatch[0].toUpperCase();
              answer = (answerLetter.charCodeAt(0) - 64).toString();
            } else if (numberMatch) {
              answer = numberMatch[0];
            }
            
            // Only add if we have content and all options
            if (content && options.length === 4) {
              result.push({
                content,
                option1: options[0],
                option2: options[1],
                option3: options[2],
                option4: options[3],
                answer
              });
            }
          } catch (e) {
            console.warn('Error parsing question match:', e);
          }
        }
        
        if (result.length > 0) {
          // If we found questions, return them
          break;
        }
      }
    }
    
    // If no questions found with patterns, fall back to simpler approach
    if (result.length === 0) {
      console.log('Falling back to basic block extraction');
      const blocks = text.split(/Question:|Q\d+:|^\d+\./m).filter(b => b.trim());
      
      for (const block of blocks) {
        try {
          // Extract question content
          const content = block.split(/Options:|A\)/).shift()?.trim() || '';
          
          // Extract options
          const optionsText = block.match(/Options:([\s\S]*?)Answer:/i)?.[1] || 
                             block.match(/A\)([\s\S]*?)Answer:/i)?.[1] || '';
                              
          const options = [];
          const optionMatches = optionsText.match(/[A-D]\)[\s\S]*?(?=[A-D]\)|Answer:|$)/g);
          
          if (optionMatches) {
            for (let i = 0; i < Math.min(optionMatches.length, 4); i++) {
              const option = optionMatches[i].replace(/^[A-D]\)/, '').trim();
              options.push(option);
            }
          }
          
          // Pad options if needed
          while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
          }
          
          // Extract answer
          const answerMatch = block.match(/Answer:[\s\S]*?([A-D1-4])/i);
          let answer = '1'; // Default to first option
          
          if (answerMatch && answerMatch[1]) {
            const answerVal = answerMatch[1].toUpperCase();
            if (/[A-D]/.test(answerVal)) {
              // Convert A,B,C,D to 1,2,3,4
              answer = (answerVal.charCodeAt(0) - 64).toString();
            } else if (/[1-4]/.test(answerVal)) {
              answer = answerVal;
            }
          }
          
          // Only add if we have content
          if (content) {
            result.push({
              content,
              option1: options[0] || 'Option A',
              option2: options[1] || 'Option B',
              option3: options[2] || 'Option C',
              option4: options[3] || 'Option D',
              answer
            });
          }
        } catch (e) {
          console.warn('Error parsing question block:', e);
        }
      }
    }
    
    return result;
  }

  private validateQuestions(questions: any[]): any[] {
    return questions.filter(q => {
      // Check that all required fields are present
      return q.content && q.option1 && q.option2 && q.option3 && q.option4 && q.answer;
    }).map(q => {
      // Normalize the answer value to make sure it's always a string '1', '2', '3', or '4'
      let normalizedAnswer = q.answer;
      
      // If answer is A, B, C, D, convert to 1, 2, 3, 4
      if (typeof normalizedAnswer === 'string') {
        if (/^[aA]$/.test(normalizedAnswer)) normalizedAnswer = '1';
        else if (/^[bB]$/.test(normalizedAnswer)) normalizedAnswer = '2';
        else if (/^[cC]$/.test(normalizedAnswer)) normalizedAnswer = '3';
        else if (/^[dD]$/.test(normalizedAnswer)) normalizedAnswer = '4';
      }
      
      // If answer is a number, convert to string
      if (typeof normalizedAnswer === 'number') {
        normalizedAnswer = normalizedAnswer.toString();
      }
      
      // Ensure answer is between 1-4
      if (!['1', '2', '3', '4'].includes(normalizedAnswer)) {
        // Default to '1' if invalid
        console.warn('Invalid answer value, defaulting to 1:', q.answer);
        normalizedAnswer = '1';
      }
      
      return {
        ...q,
        answer: normalizedAnswer
      };
    });
  }
} 