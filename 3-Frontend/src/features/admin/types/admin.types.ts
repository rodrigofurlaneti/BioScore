// ─── Food Category ─────────────────────────────────────────────────────────
export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  defaultQuotaPoints?: number;
  servingUnit?: string;
  sortOrder: number;
  isActive: boolean;
}
export interface CreateFoodCategoryPayload {
  name: string;
  description?: string;
  defaultQuotaPoints?: number;
  servingUnit?: string;
  sortOrder: number;
}
export interface UpdateFoodCategoryPayload extends CreateFoodCategoryPayload {
  id: string;
}

// ─── Food Item ─────────────────────────────────────────────────────────────
export interface FoodItem {
  id: string;
  name: string;
  points: number;
  servingSize?: string;
  notes?: string;
  foodCategoryId: string;
  isActive: boolean;
}
export interface CreateFoodItemPayload {
  foodCategoryId: string;
  name: string;
  servingSize?: string;
  points: number;
  notes?: string;
}
export interface UpdateFoodItemPayload extends CreateFoodItemPayload {
  id: string;
}

// ─── Exam Category ─────────────────────────────────────────────────────────
export interface ExamCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}
export interface CreateExamCategoryPayload {
  name: string;
  sortOrder: number;
}
export interface UpdateExamCategoryPayload extends CreateExamCategoryPayload {
  id: string;
}

// ─── Exam ──────────────────────────────────────────────────────────────────
export interface Exam {
  id: string;
  examCategoryId: string;
  name: string;
  abbreviation?: string;
  description?: string;
  isActive: boolean;
}
export interface CreateExamPayload {
  examCategoryId: string;
  name: string;
  abbreviation?: string;
  description?: string;
}
export interface UpdateExamPayload extends CreateExamPayload {
  id: string;
}
