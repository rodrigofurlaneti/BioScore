using System.Diagnostics;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.Entities;
using BioScore.Core.Modules.DietTracker.Interfaces;
using BioScore.Infrastructure.Persistence.Queries;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using IAppDbContext = BioScore.Core.Common.Interfaces.IAppDbContext;

namespace BioScore.Api.Endpoints
{
    public record PhotoRequest(string PhotoUrl);

    public static class DietEndpoints
    {
        public static void MapDietEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/diet").WithTags("DietTracker");

            // 1. Leitura com Dapper
            group.MapGet("/logs/{userId:guid}/{date:datetime}", async (Guid userId, DateTime date, HttpContext httpContext, [FromServices] DietQueries queries, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    var result = await queries.GetDailyLogDetailsAsync(userId, date);
                    isSuccess = true;
                    message = "Detalhes do diário obtidos com sucesso.";
                    return Results.Ok(result);
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
                        ClassName = nameof(DietEndpoints),
                        MethodName = "GetDailyLogDetails",
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

            // 2. Escrita com EF Core
            group.MapPost("/logs", async (DailyLog log, HttpContext httpContext, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    log.CalculateTotalPoints();
                    db.DailyLogs.Add(log);
                    await db.SaveChangesAsync();

                    isSuccess = true;
                    message = "Log diário criado com sucesso.";

                    return Results.Created($"/api/diet/logs/{log.Id}", log);
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
                        UserId = log.UserId, // Assumindo que DailyLog possui UserId
                        DirectoryName = "BioScore.Api.Endpoints",
                        ClassName = nameof(DietEndpoints),
                        MethodName = "CreateDailyLog",
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

            // 3. Rota Existente: Recebe BASE64 ou URL (Texto JSON)
            group.MapPost("/analyze-photo", async (PhotoRequest request, HttpContext httpContext, [FromServices] IFoodRecognitionService iaService, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    if (string.IsNullOrWhiteSpace(request.PhotoUrl))
                    {
                        errorMessage = "A URL ou Base64 da imagem não pode estar vazia.";
                        return Results.BadRequest(errorMessage);
                    }

                    var suggestions = await iaService.AnalyzeFoodPhotoAsync(request.PhotoUrl);

                    isSuccess = true;
                    message = "Análise Nutricional Concluída!";

                    return Results.Ok(new
                    {
                        Message = message,
                        Items = suggestions
                    });
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
                        ClassName = nameof(DietEndpoints),
                        MethodName = "AnalyzePhoto",
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

            // 4. NOVA ROTA: Recebe o Arquivo (upload direto via multipart/form-data) e converte no Backend
            group.MapPost("/upload-photo", async (IFormFile file, HttpContext httpContext, [FromServices] IFoodRecognitionService iaService, [FromServices] IAppDbContext db) =>
            {
                var stopwatch = Stopwatch.StartNew();
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
                bool isSuccess = false;
                string? errorMessage = null;
                string? message = null;

                try
                {
                    if (file == null || file.Length == 0)
                    {
                        errorMessage = "Nenhum arquivo de imagem foi enviado.";
                        return Results.BadRequest(errorMessage);
                    }

                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream);
                    var imageBytes = memoryStream.ToArray();
                    var base64String = Convert.ToBase64String(imageBytes);

                    var suggestions = await iaService.AnalyzeFoodPhotoAsync(base64String);

                    isSuccess = true;
                    message = "Imagem convertida e análise nutricional concluída com sucesso!";

                    return Results.Ok(new
                    {
                        Message = message,
                        Items = suggestions
                    });
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
                        ClassName = nameof(DietEndpoints),
                        MethodName = "UploadPhoto",
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
            })
            .DisableAntiforgery();
        }
    }
}