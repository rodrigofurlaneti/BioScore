using BioScore.Core.Modules.DietTracker.Entities;
using Microsoft.EntityFrameworkCore;

namespace BioScore.Core.Modules.DietTracker.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<DailyLog> DailyLogs { get; set; }
        DbSet<DailyLogItem> DailyLogItems { get; set; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
