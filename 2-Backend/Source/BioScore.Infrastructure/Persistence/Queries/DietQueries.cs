using System.Data;
using System.Diagnostics;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace BioScore.Infrastructure.Persistence.Queries
{
    public class DietQueries
    {
        private readonly string _connectionString;
        private readonly IAppDbContext _context;

        public DietQueries(IConfiguration configuration, IAppDbContext context)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
            _context = context;
        }

        public async Task<IEnumerable<DailyLogDetailedView>> GetDailyLogDetailsAsync(Guid userId, DateTime date)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;
            IEnumerable<DailyLogDetailedView> result = Enumerable.Empty<DailyLogDetailedView>();

            try
            {
                using IDbConnection db = new SqlConnection(_connectionString);

                var sql = @"
                SELECT * FROM dbo.vw_DailyLogDetailed 
                WHERE UserId = @UserId AND LogDate = @LogDate";

                result = await db.QueryAsync<DailyLogDetailedView>(sql, new { UserId = userId, LogDate = date });

                isSuccess = true;
                message = "Detalhes do diário obtidos com sucesso via Dapper.";
                return result;
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorMessage = ex.Message;
                throw;
            }
            finally
            {
                stopwatch.Stop();

                _context.LogTrackers.Add(new LogTracker
                {
                    UserId = userId,
                    DirectoryName = "BioScore.Infrastructure.Persistence.Queries",
                    ClassName = nameof(DietQueries),
                    MethodName = nameof(GetDailyLogDetailsAsync),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                    Message = message,
                    ErrorMessage = errorMessage,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                });

                await _context.SaveChangesAsync();
            }
        }
    }
}