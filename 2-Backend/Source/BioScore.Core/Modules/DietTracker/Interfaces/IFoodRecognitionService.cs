using BioScore.Core.Modules.DietTracker.DTOs;

namespace BioScore.Core.Modules.DietTracker.Interfaces
{
    public interface IFoodRecognitionService
    {
        Task<List<FoodAnalysisItem>> AnalyzeFoodPhotoAsync(string imageBase64OrUrl);
    }
}
