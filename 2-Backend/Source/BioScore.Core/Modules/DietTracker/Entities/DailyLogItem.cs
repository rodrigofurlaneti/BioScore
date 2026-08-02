using System;
using System.Collections.Generic;
using System.Text;

namespace BioScore.Core.Modules.DietTracker.Entities
{
    public class DailyLogItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DailyLogId { get; set; }
        public Guid FoodItemId { get; set; }
        public decimal Quantity { get; set; } = 1m;
        public short PointsComputed { get; set; }
        public TimeSpan? MealTime { get; set; }
        public string? Notes { get; set; }
    }
}
