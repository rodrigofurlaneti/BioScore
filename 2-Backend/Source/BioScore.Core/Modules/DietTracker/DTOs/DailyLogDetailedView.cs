namespace BioScore.Core.Modules.DietTracker.DTOs
{
    public class DailyLogDetailedView
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime LogDate { get; set; }
        public short TotalPoints { get; set; }
        public string FoodCategory { get; set; } = string.Empty;
        public string FoodItem { get; set; } = string.Empty;
        public string? ServingSize { get; set; }
        public decimal Quantity { get; set; }
        public short PointsComputed { get; set; }
        public TimeSpan? MealTime { get; set; }
    }
}
