using BioScore.Core.Modules.DietTracker.Interfaces;

namespace BioScore.Infrastructure.ExternalServices;

public class GoogleVisionFoodAdapter : IFoodRecognitionService
{
    public async Task<List<string>> AnalyzeFoodPhotoAsync(string imageUrl)
    {
        await Task.Delay(2000);
        return new List<string> { "Arroz Branco", "Bife Magro" };
    }
}