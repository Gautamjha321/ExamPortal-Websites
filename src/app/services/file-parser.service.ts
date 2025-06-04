import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileParserService {

  constructor() { }

  /**
   * Parse a JSON file containing questions
   * Expected format:
   * [
   *   {
   *     "content": "Question text",
   *     "option1": "Option 1",
   *     "option2": "Option 2",
   *     "option3": "Option 3",
   *     "option4": "Option 4",
   *     "answer": "Option 1"
   *   },
   *   ...
   * ]
   */
  parseJsonFile(content: string): any[] {
    try {
      const parsedData = JSON.parse(content);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('JSON file must contain an array of questions');
      }
      
      return parsedData.filter(q => this.isValidQuestion(q));
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw error;
    }
  }

  /**
   * Parse a CSV file containing questions
   * Expected format:
   * content,option1,option2,option3,option4,answer
   * "Question 1","Option 1","Option 2","Option 3","Option 4","Option 1"
   * "Question 2","Option 1","Option 2","Option 3","Option 4","Option 2"
   */
  parseCsvFile(content: string): any[] {
    try {
      // Split by newlines, filtering out empty lines
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one question');
      }
      
      // Parse header row to get field names
      const headers = this.parseCSVLine(lines[0]);
      const requiredFields = ['content', 'option1', 'option2', 'answer'];
      
      // Check if all required fields are present
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        throw new Error(`CSV file is missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Parse data rows
      const questions = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = this.parseCSVLine(line);
        
        // Skip lines with incorrect column count
        if (values.length !== headers.length) {
          console.warn(`Skipping line ${i+1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
          continue;
        }
        
        // Create question object
        const question: any = {};
        headers.forEach((header, index) => {
          question[header] = values[index];
        });
        
        // Ensure quiz property exists (will be populated later)
        question.quiz = {};
        
        if (this.isValidQuestion(question)) {
          questions.push(question);
        } else {
          console.warn(`Skipping invalid question at line ${i+1}`);
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw error;
    }
  }

  /**
   * Parse a CSV line, handling quoted values with commas
   */
  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes (two double quotes in a row)
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    // Clean up quotes from fields
    return result.map(field => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.substring(1, field.length - 1);
      }
      return field;
    });
  }

  /**
   * Validate if a question object has all required fields
   */
  private isValidQuestion(question: any): boolean {
    // Check required fields
    if (!question.content || !question.option1 || !question.option2 || !question.answer) {
      console.warn('Question missing required fields:', question);
      return false;
    }
    
    // Check if answer is one of the options
    const options = [
      question.option1, 
      question.option2, 
      question.option3, 
      question.option4
    ].filter(Boolean);
    
    const isValid = options.includes(question.answer);
    if (!isValid) {
      console.warn('Answer is not one of the options:', question);
    }
    
    return isValid;
  }
}