namespace BioScore.Core.Modules.DietTracker.DTOs
{
    public class FoodAnalysisItem
    {
        public string FoodName { get; set; } = string.Empty;
        public string EstimatedQuantity { get; set; } = string.Empty;
        public int EstimatedCalories { get; set; }
    }
}
