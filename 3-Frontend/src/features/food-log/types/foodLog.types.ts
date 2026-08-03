export interface FoodItem {
  id: string;
  name: string;
  servingSize?: string;
  points: number;
  foodCategoryId: string;
  isActive: boolean;
}

export interface DailyLogItem {
  id: string;
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  pointsComputed: number;
  mealTime?: string;
  notes?: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  totalPoints: number;
  notes?: string;
  items: DailyLogItem[];
}

export interface PhotoAnalysisResult {
  identifiedFoodName: string;
  estimatedPortionGrams: number;
  caloriesPer100g: number;
  isConfident: boolean;
  notes?: string;
  matchedFoodItemId?: string;
  matchedFoodItemName?: string;
  matchedFoodItemPoints?: number;
  wasAutoCreated: boolean;
  wasCatalogUpdated: boolean;
}

export interface AddLogItemRequest {
  foodItemId: string;
  quantity: number;
  pointsPerServing: number;
  mealTime?: string;
  notes?: string;
}
