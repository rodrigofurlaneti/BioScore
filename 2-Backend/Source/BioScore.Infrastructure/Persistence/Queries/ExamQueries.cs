using BioScore.Core.Modules.Exams.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace BioScore.Infrastructure.Persistence.Queries
{
    public class ExamQueries
    {
        private readonly string _connectionString;

        public ExamQueries(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string is missing");
        }

        public async Task<IEnumerable<ExamUserView>> GetPendingExamsByUserAsync(Guid userId)
        {
            using var connection = new SqlConnection(_connectionString);
            var sql = "SELECT * FROM vw_ExamsByUser WHERE UserId = @UserId AND IsCompleted = 0 ORDER BY ExamCategory, ExamName";
            return await connection.QueryAsync<ExamUserView>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<ExamUserView>> GetAllExamsByUserAsync(Guid userId)
        {
            using var connection = new SqlConnection(_connectionString);
            var sql = "SELECT * FROM vw_ExamsByUser WHERE UserId = @UserId ORDER BY RequestDate DESC, ExamCategory";
            return await connection.QueryAsync<ExamUserView>(sql, new { UserId = userId });
        }
    }
}
