using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.Entities;
using Microsoft.EntityFrameworkCore;

namespace BioScore.Infrastructure.Persistence
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<DailyLog> DailyLogs { get; set; }
        public DbSet<DailyLogItem> DailyLogItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapeamento DailyLog
            modelBuilder.Entity<DailyLog>(entity =>
            {
                entity.ToTable("DailyLog"); // O nome exato da sua tabela no SQL
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.DailyLogId);
            });

            // Mapeamento DailyLogItem
            modelBuilder.Entity<DailyLogItem>(entity =>
            {
                entity.ToTable("DailyLogItem");
                entity.HasKey(e => e.Id);
            });
        }
    }
}
