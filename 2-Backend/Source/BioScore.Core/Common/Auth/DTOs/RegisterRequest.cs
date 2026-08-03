namespace BioScore.Core.Common.Auth.DTOs
{
    public record RegisterRequest(
        string FullName,
        string Email,
        string Username,
        string Password,
        string Gender,
        string? PhoneNumber,
        DateTime? BirthDate
    );
}
