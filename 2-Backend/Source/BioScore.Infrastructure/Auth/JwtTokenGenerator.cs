using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BioScore.Core.Common.Auth;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BioScore.Infrastructure.Auth
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _config;
        private readonly IAppDbContext _context;

        public JwtTokenGenerator(IConfiguration config, IAppDbContext context)
        {
            _config = config;
            _context = context;
        }

        public string GenerateToken(User user)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;
            string tokenString = string.Empty;

            try
            {
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Name, user.FullName),
                    new Claim(ClaimTypes.NameIdentifier, user.Username)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(double.Parse(_config["Jwt:ExpireMinutes"]!)),
                    signingCredentials: creds
                );

                tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                isSuccess = true;
                message = "Token JWT gerado com sucesso.";

                return tokenString;
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorMessage = ex.Message;
                throw;
            }
            finally
            {
                stopwatch.Stop();

                _context.LogTrackers.Add(new LogTracker
                {
                    UserId = user.Id,
                    DirectoryName = "BioScore.Infrastructure.Auth",
                    ClassName = nameof(JwtTokenGenerator),
                    MethodName = nameof(GenerateToken),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                    Message = message,
                    ErrorMessage = errorMessage,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                });

                _context.SaveChangesAsync().Wait();
            }
        }
    }
}