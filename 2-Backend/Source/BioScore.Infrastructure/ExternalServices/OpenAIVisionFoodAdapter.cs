using System.Diagnostics;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using BioScore.Core.Modules.DietTracker.DTOs;
using BioScore.Core.Modules.DietTracker.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BioScore.Infrastructure.ExternalServices
{
    public class OpenAIVisionFoodAdapter : IFoodRecognitionService
    {
        private readonly ILogger<OpenAIVisionFoodAdapter> _logger;
        private readonly BioScore.Core.Common.Interfaces.IAppDbContext _context; // Namespace explicitamente definido para evitar ambiguidade
        private readonly string _apiKey;

        public OpenAIVisionFoodAdapter(ILogger<OpenAIVisionFoodAdapter> logger, BioScore.Core.Common.Interfaces.IAppDbContext context, IConfiguration config)
        {
            _logger = logger;
            _context = context;
            _apiKey = config["OpenAiApiKey"] ?? throw new InvalidOperationException("Chave da OpenAI não configurada.");
        }

        public async Task<List<FoodAnalysisItem>> AnalyzeFoodPhotoAsync(string imageBase64OrUrl)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;
            List<FoodAnalysisItem> resultItems = new();

            try
            {
                string imageUrl = imageBase64OrUrl.StartsWith("http")
                    ? imageBase64OrUrl
                    : $"data:image/jpeg;base64,{imageBase64OrUrl.Replace("data:image/jpeg;base64,", "")}";

                using var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var requestBody = new
                {
                    model = "gpt-4o",
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new
                        {
                            role = "user",
                            content = new object[]
                            {
                                new {
                                    type = "text",
                                    text = "Você é um nutricionista especialista. Analise esta imagem de comida. Estime a quantidade de cada alimento e as calorias. Retorne APENAS um JSON no formato: { \"items\": [ { \"foodName\": \"Arroz Branco\", \"estimatedQuantity\": \"150g\", \"estimatedCalories\": 195 } ] }"
                                },
                                new {
                                    type = "image_url",
                                    image_url = new { url = imageUrl }
                                }
                            }
                        }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Erro na OpenAI: {error}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseJson);
                var aiMessage = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                var result = JsonSerializer.Deserialize<OpenAiResponseWrapper>(aiMessage ?? "{}", new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                resultItems = result?.Items ?? new List<FoodAnalysisItem>();
                isSuccess = true;
                message = "Análise de imagem realizada com sucesso pela OpenAI.";

                return resultItems;
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorMessage = ex.Message;
                _logger.LogError(ex, "Erro ao analisar imagem com OpenAI Vision.");
                throw new InvalidOperationException($"Falha na IA: {ex.Message}");
            }
            finally
            {
                stopwatch.Stop();

                _context.LogTrackers.Add(new LogTracker
                {
                    DirectoryName = "BioScore.Infrastructure.ExternalServices",
                    ClassName = nameof(OpenAIVisionFoodAdapter),
                    MethodName = nameof(AnalyzeFoodPhotoAsync),
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

        private class OpenAiResponseWrapper
        {
            public List<FoodAnalysisItem> Items { get; set; } = new();
        }
    }
}