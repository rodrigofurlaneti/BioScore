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
            // AVISO DO ARQUITETO: [FromServices] adicionado aqui para o .NET não achar que 'queries' vem do JSON!
            group.MapGet("/user/{userId:guid}/pending", async (Guid userId, [FromServices] ExamQueries queries) =>
            {
                var exams = await queries.GetPendingExamsByUserAsync(userId);
                return Results.Ok(exams);
            });

            // 2. ESCRITA SEGURA (Usando EF Core)
            // AVISO DO ARQUITETO: [FromBody] removido! O .NET 9 já sabe que 'ExamRequest' vem do corpo (JSON).
            group.MapPost("/request", async (ExamRequest request, [FromServices] IAppDbContext db) =>
            {
                request.CreatedAt = DateTime.UtcNow;
                db.ExamRequests.Add(request);
                await db.SaveChangesAsync();

                return Results.Created($"/api/exams/request/{request.Id}", request);
            });

            // 3. ATUALIZAÇÃO SEGURA (Usando EF Core)
            group.MapPut("/request-item/{itemId:guid}/complete", async (Guid itemId, [FromServices] IAppDbContext db) =>
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