using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.Entities;
using BioScore.Core.Modules.DietTracker.Interfaces;
using BioScore.Infrastructure.Persistence.Queries;
using Microsoft.AspNetCore.Mvc;
using IAppDbContext = BioScore.Core.Common.Interfaces.IAppDbContext;

namespace BioScore.Api.Endpoints
{
    public static class DietEndpoints
    {
        public static void MapDietEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/diet");

            // 1. Endpoint usando DAPPER para Leitura Rápida (Consultando a View)
            group.MapGet("/logs/{userId}/{date}", async (Guid userId, DateTime date, DietQueries queries) =>
            {
                var result = await queries.GetDailyLogDetailsAsync(userId, date);
                return Results.Ok(result);
            });

            // 2. Endpoint usando EF Core para Escrita (Transacional)
            group.MapPost("/logs", async (DailyLog log, IAppDbContext db) =>
            {
                log.CalculateTotalPoints(); // Regra de negócio no Core!
                db.DailyLogs.Add(log);
                await db.SaveChangesAsync();
                return Results.Created($"/api/diet/logs/{log.Id}", log);
            });

            // 3. Endpoint usando a Porta da IA (Arquitetura Hexagonal na prática)
            group.MapPost("/analyze-photo", async ([FromBody] string photoUrl, IFoodRecognitionService iaService) =>
            {
                var suggestions = await iaService.AnalyzeFoodPhotoAsync(photoUrl);
                return Results.Ok(new { Message = "Confirme os alimentos encontrados:", Items = suggestions });
            });
        }
    }
}
