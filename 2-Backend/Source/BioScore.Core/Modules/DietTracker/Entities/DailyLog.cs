namespace BioScore.Core.Modules.DietTracker.Entities;

public class DailyLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime LogDate { get; set; }
    public short TotalPoints { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Relacionamento (EF Core usará isso para navegação)
    public ICollection<DailyLogItem> Items { get; set; } = new List<DailyLogItem>();

    // Comportamento de Domínio (O Core faz a matemática, não a API)
    public void CalculateTotalPoints()
    {
        TotalPoints = (short)Items.Sum(i => i.PointsComputed * (short)Math.Round(i.Quantity));
        UpdatedAt = DateTime.UtcNow;
    }
}