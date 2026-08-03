using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BioScore.Core.Common.Auth
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
