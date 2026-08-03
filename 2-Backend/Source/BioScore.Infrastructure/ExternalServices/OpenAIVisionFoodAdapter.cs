using BioScore.Core.Modules.DietTracker.DTOs;
using BioScore.Core.Modules.DietTracker.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BioScore.Infrastructure.ExternalServices
{
    public class OpenAIVisionFoodAdapter : IFoodRecognitionService
    {
        private readonly ILogger<OpenAIVisionFoodAdapter> _logger;
        private readonly string _apiKey;

        public OpenAIVisionFoodAdapter(ILogger<OpenAIVisionFoodAdapter> logger, IConfiguration config)
        {
            _logger = logger;
            // Ele vai buscar a chave da OpenAI no seu appsettings.json ou variáveis de ambiente
            _apiKey = config["OpenAiApiKey"] ?? throw new InvalidOperationException("Chave da OpenAI não configurada.");
        }

        public async Task<List<FoodAnalysisItem>> AnalyzeFoodPhotoAsync(string imageBase64OrUrl)
        {
            try
            {
                // Garante que o Base64 tem o prefixo correto para a OpenAI
                string imageUrl = imageBase64OrUrl.StartsWith("http")
                    ? imageBase64OrUrl
                    : $"data:image/jpeg;base64,{imageBase64OrUrl.Replace("data:image/jpeg;base64,", "")}";

                using var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                // Montamos o Prompt (A Engenharia de Prompt para a IA)
                var requestBody = new
                {
                    model = "gpt-4o",
                    response_format = new { type = "json_object" }, // Força a IA a devolver um JSON perfeito
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

                // Extrai o JSON gerado pela IA
                using var doc = JsonDocument.Parse(responseJson);
                var aiMessage = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                // Deserializa para o nosso DTO
                var result = JsonSerializer.Deserialize<OpenAiResponseWrapper>(aiMessage ?? "{}", new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return result?.Items ?? new List<FoodAnalysisItem>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao analisar imagem com OpenAI Vision.");
                throw new InvalidOperationException($"Falha na IA: {ex.Message}");
            }
        }

        // Classe auxiliar apenas para mapear o JSON raiz que pedimos para a IA gerar
        private class OpenAiResponseWrapper
        {
            public List<FoodAnalysisItem> Items { get; set; } = new();
        }
    }
}
