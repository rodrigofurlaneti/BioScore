using BioScore.Core.Common.Auth;
using BioScore.Core.Common.Auth.DTOs;
using BioScore.Core.Common.Auth.Entities;
using BioScore.Core.Common.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioScore.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        // 1. ENDPOINT DE REGISTRO
        group.MapPost("/register", async (RegisterRequest request, [FromServices] IAppDbContext db) =>
        {
            // Verifica se já existe usuário com o mesmo email ou username
            var userExists = await db.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username);
            if (userExists)
            {
                return Results.BadRequest(new { message = "E-mail ou nome de usuário já cadastrados." });
            }

            // Cria o hash seguro da senha com BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                Username = request.Username,
                PasswordHash = passwordHash,
                Gender = request.Gender,
                PhoneNumber = request.PhoneNumber,
                BirthDate = request.BirthDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Usuário registrado com sucesso!", userId = newUser.Id });
        })
        .AllowAnonymous();

        // 2. ENDPOINT DE LOGIN (O que já tínhamos estruturado)
        group.MapPost("/login", async (LoginRequest request, [FromServices] IAppDbContext db, [FromServices] IJwtTokenGenerator tokenGenerator) =>
        {
            var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var token = tokenGenerator.GenerateToken(user);

            return Results.Ok(new AuthResponse(token, user.FullName, user.Email));
        })
        .AllowAnonymous();
    }
}