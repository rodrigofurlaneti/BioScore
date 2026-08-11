using System.Diagnostics;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.Exams.Entities;
using BioScore.Infrastructure.Persistence.Queries;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BioScore.Api.Endpoints
{
    public static class ExamEndpoints
    {
        public static void MapExamEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/exams").WithTags("Exams");

            // 1. LEITURA RÁPIDA (Usando Dapper)
            group.MapGet("/user/{userId:guid}/pending", async (Guid userId, HttpContext httpContext, [FromServices] ExamQueries queries, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    var exams = await queries.GetPendingExamsByUserAsync(userId);
                    isSuccess = true;
                    message = "Exames pendentes obtidos com sucesso.";
                    return Results.Ok(exams);
                }
                catch (Exception ex)
                {
                    isSuccess = false;
                    errorMessage = ex.Message;
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
                finally
                {
                    stopwatch.Stop();
                    db.LogTrackers.Add(new LogTracker
                    {
                        UserId = userId,
                        DirectoryName = "BioScore.Api.Endpoints",
                        ClassName = nameof(ExamEndpoints),
                        MethodName = "GetPendingExamsByUser",
                        IsSuccess = isSuccess,
                        ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                        Message = message,
                        ErrorMessage = errorMessage,
                        IpAddress = ipAddress,
                        CreatedAt = DateTime.Now,
                        IsActive = true
                    });
                    await db.SaveChangesAsync();
                }
            });

            // 2. ESCRITA SEGURA (Usando EF Core)
            group.MapPost("/request", async (ExamRequest request, HttpContext httpContext, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    request.CreatedAt = DateTime.Now;
                    db.ExamRequests.Add(request);
                    await db.SaveChangesAsync();

                    isSuccess = true;
                    message = "Solicitação de exame criada com sucesso.";

                    return Results.Created($"/api/exams/request/{request.Id}", request);
                }
                catch (Exception ex)
                {
                    isSuccess = false;
                    errorMessage = ex.Message;
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
                finally
                {
                    stopwatch.Stop();
                    db.LogTrackers.Add(new LogTracker
                    {
                        UserId = request.UserId, // Assumindo que ExamRequest possui UserId
                        DirectoryName = "BioScore.Api.Endpoints",
                        ClassName = nameof(ExamEndpoints),
                        MethodName = "CreateExamRequest",
                        IsSuccess = isSuccess,
                        ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                        Message = message,
                        ErrorMessage = errorMessage,
                        IpAddress = ipAddress,
                        CreatedAt = DateTime.Now,
                        IsActive = true
                    });
                    await db.SaveChangesAsync();
                }
            });

            // 3. ATUALIZAÇÃO SEGURA (Usando EF Core)
            group.MapPut("/request-item/{itemId:guid}/complete", async (Guid itemId, HttpContext httpContext, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    var item = await db.ExamRequestItems.FindAsync(itemId);
                    if (item == null)
                    {
                        errorMessage = "Item de requisição de exame não encontrado.";
                        return Results.NotFound();
                    }

                    item.IsCompleted = true;
                    item.CompletedDate = DateTime.Now;
                    await db.SaveChangesAsync();

                    isSuccess = true;
                    message = "Item de exame marcado como concluído.";

                    return Results.NoContent();
                }
                catch (Exception ex)
                {
                    isSuccess = false;
                    errorMessage = ex.Message;
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
                finally
                {
                    stopwatch.Stop();
                    db.LogTrackers.Add(new LogTracker
                    {
                        DirectoryName = "BioScore.Api.Endpoints",
                        ClassName = nameof(ExamEndpoints),
                        MethodName = "CompleteExamRequestItem",
                        IsSuccess = isSuccess,
                        ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                        Message = message,
                        ErrorMessage = errorMessage,
                        IpAddress = ipAddress,
                        CreatedAt = DateTime.Now,
                        IsActive = true
                    });
                    await db.SaveChangesAsync();
                }
            });
        }
    }
}