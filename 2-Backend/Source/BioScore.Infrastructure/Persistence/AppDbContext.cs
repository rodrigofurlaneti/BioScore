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
        public DbSet<LogTracker> LogTrackers => Set<LogTracker>();
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

            modelBuilder.Entity<LogTracker>(entity =>
            {
                entity.ToTable("LogTracker");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).UseIdentityColumn();
                entity.Property(e => e.ClassName).HasMaxLength(150).IsRequired();
                entity.Property(e => e.MethodName).HasMaxLength(150).IsRequired();
                entity.Property(e => e.DirectoryName).HasMaxLength(150);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIME()");
                entity.Property(e => e.IsSuccess).HasDefaultValue(true);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}