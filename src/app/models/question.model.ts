export interface Question {
  quesId?: string;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  quiz?: {
    qId: string;
  };
  category?: {
    cid: string;
  };
  isSelected?: boolean;
} 