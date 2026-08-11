namespace BioScore.Core.Modules.DietTracker.Entities;

public class DailyLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime LogDate { get; set; }
    public short TotalPoints { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<DailyLogItem> Items { get; set; } = new List<DailyLogItem>();
    public void CalculateTotalPoints()
    {
        TotalPoints = (short)Items.Sum(i => i.PointsComputed * (short)Math.Round(i.Quantity));
        UpdatedAt = DateTime.Now;
    }
}