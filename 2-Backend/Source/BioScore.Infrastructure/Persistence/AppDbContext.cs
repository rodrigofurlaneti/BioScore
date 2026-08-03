using BioScore.Core.Common.Auth.Entities; // <-- Ajustado para bater certo com o namespace do seu User.cs
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.Entities;
using BioScore.Core.Modules.Exams.Entities;
using Microsoft.EntityFrameworkCore;

namespace BioScore.Infrastructure.Persistence
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
        public DbSet<DailyLogItem> DailyLogItems => Set<DailyLogItem>();
        public DbSet<ExamCategory> ExamCategories => Set<ExamCategory>();
        public DbSet<Exam> Exams => Set<Exam>();
        public DbSet<ExamRequest> ExamRequests => Set<ExamRequest>();
        public DbSet<ExamRequestItem> ExamRequestItems => Set<ExamRequestItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ExamRequestItem>()
                .HasOne<Exam>()
                .WithMany()
                .HasForeignKey(e => e.ExamId);

            modelBuilder.Entity<ExamRequestItem>()
                .HasIndex(e => new { e.ExamRequestId, e.ExamId }).IsUnique();
        }
    }
}