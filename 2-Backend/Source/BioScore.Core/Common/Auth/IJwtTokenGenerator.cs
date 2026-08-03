using BioScore.Core.Common.Auth.Entities;

namespace BioScore.Core.Common.Auth
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
