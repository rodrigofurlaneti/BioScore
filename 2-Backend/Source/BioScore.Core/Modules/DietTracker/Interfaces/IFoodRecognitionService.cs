namespace BioScore.Core.Modules.DietTracker.Interfaces
{
    public interface IFoodRecognitionService
    {
        Task<List<string>> AnalyzeFoodPhotoAsync(string imageUrl);
    }
}
