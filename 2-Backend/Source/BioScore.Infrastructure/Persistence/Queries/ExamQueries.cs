using System.Diagnostics;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.Exams.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace BioScore.Infrastructure.Persistence.Queries
{
    public class ExamQueries
    {
        private readonly string _connectionString;
        private readonly IAppDbContext _context;

        public ExamQueries(IConfiguration config, IAppDbContext context)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string is missing");
            _context = context;
        }

        public async Task<IEnumerable<ExamUserView>> GetPendingExamsByUserAsync(Guid userId)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;
            IEnumerable<ExamUserView> result = Enumerable.Empty<ExamUserView>();

            try
            {
                using var connection = new SqlConnection(_connectionString);
                var sql = "SELECT * FROM vw_ExamsByUser WHERE UserId = @UserId AND IsCompleted = 0 ORDER BY ExamCategory, ExamName";
                result = await connection.QueryAsync<ExamUserView>(sql, new { UserId = userId });

                isSuccess = true;
                message = "Exames pendentes obtidos com sucesso via Dapper.";
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
                    ClassName = nameof(ExamQueries),
                    MethodName = nameof(GetPendingExamsByUserAsync),
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

        public async Task<IEnumerable<ExamUserView>> GetAllExamsByUserAsync(Guid userId)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;
            IEnumerable<ExamUserView> result = Enumerable.Empty<ExamUserView>();

            try
            {
                using var connection = new SqlConnection(_connectionString);
                var sql = "SELECT * FROM vw_ExamsByUser WHERE UserId = @UserId ORDER BY RequestDate DESC, ExamCategory";
                result = await connection.QueryAsync<ExamUserView>(sql, new { UserId = userId });

                isSuccess = true;
                message = "Todos os exames do usuário obtidos com sucesso via Dapper.";
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
                    ClassName = nameof(ExamQueries),
                    MethodName = nameof(GetAllExamsByUserAsync),
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