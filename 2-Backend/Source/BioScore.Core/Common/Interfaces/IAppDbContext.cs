using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Modules.DietTracker.Entities;
using BioScore.Core.Modules.Exams.Entities;
using Microsoft.EntityFrameworkCore;

namespace BioScore.Core.Common.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<User> Users { get; }
        DbSet<LogTracker> LogTrackers { get; }
        DbSet<DailyLog> DailyLogs { get; }
        DbSet<DailyLogItem> DailyLogItems { get; }
        DbSet<ExamCategory> ExamCategories { get; }
        DbSet<Exam> Exams { get; }
        DbSet<ExamRequest> ExamRequests { get; }
        DbSet<ExamRequestItem> ExamRequestItems { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}