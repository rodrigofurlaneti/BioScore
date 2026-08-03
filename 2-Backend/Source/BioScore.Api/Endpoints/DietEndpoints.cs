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
            group.MapGet("/logs/{userId:guid}/{date:datetime}", async (Guid userId, DateTime date, [FromServices] DietQueries queries) =>
            {
                var result = await queries.GetDailyLogDetailsAsync(userId, date);
                return Results.Ok(result);
            });

            // 2. Escrita com EF Core
            group.MapPost("/logs", async (DailyLog log, [FromServices] IAppDbContext db) =>
            {
                log.CalculateTotalPoints();
                db.DailyLogs.Add(log);
                await db.SaveChangesAsync();
                return Results.Created($"/api/diet/logs/{log.Id}", log);
            });

            // 3. Rota Existente: Recebe BASE64 ou URL (Texto JSON)
            group.MapPost("/analyze-photo", async (PhotoRequest request, [FromServices] IFoodRecognitionService iaService) =>
            {
                if (string.IsNullOrWhiteSpace(request.PhotoUrl))
                    return Results.BadRequest("A URL ou Base64 da imagem não pode estar vazia.");

                var suggestions = await iaService.AnalyzeFoodPhotoAsync(request.PhotoUrl);

                // MENSAGEM ALTERADA PARA REFLETIR O NOVO RETORNO DA OPENAI
                return Results.Ok(new
                {
                    Message = "Análise Nutricional Concluída!",
                    Items = suggestions
                });
            });

            // 4. NOVA ROTA: Recebe o Arquivo (upload direto via multipart/form-data) e converte no Backend
            group.MapPost("/upload-photo", async (IFormFile file, [FromServices] IFoodRecognitionService iaService) =>
            {
                if (file == null || file.Length == 0)
                    return Results.BadRequest("Nenhum arquivo de imagem foi enviado.");

                // Converte o arquivo enviado para Array de Bytes e depois para Base64
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();
                var base64String = Convert.ToBase64String(imageBytes);

                // Envia a string Base64 gerada para o serviço de IA
                var suggestions = await iaService.AnalyzeFoodPhotoAsync(base64String);

                // MENSAGEM ALTERADA AQUI TAMBÉM
                return Results.Ok(new
                {
                    Message = "Imagem convertida e análise nutricional concluída com sucesso!",
                    Items = suggestions
                });
            })
            .DisableAntiforgery(); // Necessário para aceitar envios de arquivos via form-data nas Minimal APIs
        }
    }
}