using System.Data;
using BioScore.Core.Modules.DietTracker.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace BioScore.Infrastructure.Persistence.Queries
{
    public class DietQueries
    {
        private readonly string _connectionString;

        public DietQueries(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<DailyLogDetailedView>> GetDailyLogDetailsAsync(Guid userId, DateTime date)
        {
            using IDbConnection db = new SqlConnection(_connectionString);

            // Chamando a sua View!
            var sql = @"
            SELECT * FROM dbo.vw_DailyLogDetailed 
            WHERE UserId = @UserId AND LogDate = @LogDate";

            return await db.QueryAsync<DailyLogDetailedView>(sql, new { UserId = userId, LogDate = date });
        }
    }
}
