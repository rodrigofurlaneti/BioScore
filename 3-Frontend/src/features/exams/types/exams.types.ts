export interface ExamCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Exam {
  id: string;
  examCategoryId: string;
  name: string;
  abbreviation?: string;
  description?: string;
  isActive: boolean;
}

export interface ExamRequestItem {
  id: string;
  examId: string;
  examName: string;
  abbreviation?: string;
  isCompleted: boolean;
  completedDate?: string;
  result?: string;
  laboratory?: string;
}

export interface ExamRequest {
  id: string;
  userId: string;
  requestDate: string;
  doctorName?: string;
  notes?: string;
  items: ExamRequestItem[];
}

export interface CreateExamRequestPayload {
  doctorName?: string;
  notes?: string;
  examIds: string[];
}

export interface UpdateExamItemPayload {
  completedDate: string;
  result?: string;
  laboratory?: string;
}
