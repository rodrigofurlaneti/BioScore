using BioScore.Core.Modules.Exams.Entities;
using BioScore.Infrastructure.Persistence.Queries;
using IAppDbContext = BioScore.Core.Common.Interfaces.IAppDbContext;
using Microsoft.AspNetCore.Mvc; 

namespace BioScore.Api.Endpoints
{
    public static class ExamEndpoints
    {
        public static void MapExamEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/exams").WithTags("Exams");

            // 1. LEITURA RÁPIDA (Usando Dapper)
            group.MapGet("/user/{userId:guid}/pending", async (Guid userId, ExamQueries queries) =>
            {
                var exams = await queries.GetPendingExamsByUserAsync(userId);
                return Results.Ok(exams);
            });

            // 2. ESCRITA SEGURA (Usando EF Core)
            group.MapPost("/request", async ([FromBody] ExamRequest request, IAppDbContext db) =>
            {
                request.CreatedAt = DateTime.UtcNow;
                db.ExamRequests.Add(request);
                await db.SaveChangesAsync();

                return Results.Created($"/api/exams/request/{request.Id}", request);
            });

            // 3. ATUALIZAÇÃO SEGURA (Usando EF Core)
            group.MapPut("/request-item/{itemId:guid}/complete", async (Guid itemId, IAppDbContext db) =>
            {
                var item = await db.ExamRequestItems.FindAsync(itemId);
                if (item == null) return Results.NotFound();

                item.IsCompleted = true;
                item.CompletedDate = DateTime.UtcNow;
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
