using System.Diagnostics;
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

        // 1. ENDPOINT DE REGISTRO COM LOGS
        group.MapPost("/register", async (RegisterRequest request, HttpContext httpContext, [FromServices] IAppDbContext db) =>
        {
            var stopwatch = Stopwatch.StartNew();
            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
            Guid? userId = null;
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;

            try
            {
                // Verifica se já existe usuário com o mesmo email ou username
                var userExists = await db.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username);
                if (userExists)
                {
                    message = "E-mail ou nome de usuário já cadastrados.";
                    errorMessage = "Tentativa de registro com credenciais já existentes.";
                    return Results.BadRequest(new { message });
                }

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
                    CreatedAt = DateTime.Now
                };

                db.Users.Add(newUser);
                await db.SaveChangesAsync();

                userId = newUser.Id;
                isSuccess = true;
                message = "Usuário registrado com sucesso!";

                return Results.Ok(new { message, userId = newUser.Id });
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorMessage = ex.Message;
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            finally
            {
                stopwatch.Stop();

                // Grava o log da operação
                db.LogTrackers.Add(new LogTracker
                {
                    UserId = userId,
                    DirectoryName = "BioScore.Api.Endpoints",
                    ClassName = nameof(AuthEndpoints),
                    MethodName = "Register",
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                    Message = message,
                    ErrorMessage = errorMessage,
                    IpAddress = ipAddress,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                });
                await db.SaveChangesAsync();
            }
        })
        .AllowAnonymous();

        // 2. ENDPOINT DE LOGIN COM LOGS
        group.MapPost("/login", async (LoginRequest request, HttpContext httpContext, [FromServices] IAppDbContext db, [FromServices] IJwtTokenGenerator tokenGenerator) =>
        {
            var stopwatch = Stopwatch.StartNew();
            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
            Guid? userId = null;
            bool isSuccess = false;
            string? errorMessage = null;
            string? message = null;

            try
            {
                var user = await db.Users.SingleOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    errorMessage = "Credenciais inválidas ou usuário inativo.";
                    return Results.Unauthorized();
                }

                userId = user.Id;
                isSuccess = true;
                message = "Login realizado com sucesso.";

                var token = tokenGenerator.GenerateToken(user);

                return Results.Ok(new AuthResponse(token, user.FullName, user.Email));
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorMessage = ex.Message;
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            finally
            {
                stopwatch.Stop();

                // Grava o log da operação
                db.LogTrackers.Add(new LogTracker
                {
                    UserId = userId,
                    DirectoryName = "BioScore.Api.Endpoints",
                    ClassName = nameof(AuthEndpoints),
                    MethodName = "Login",
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                    Message = message,
                    ErrorMessage = errorMessage,
                    IpAddress = ipAddress,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                });
                await db.SaveChangesAsync();
            }
        })
        .AllowAnonymous();
    }
}