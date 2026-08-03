using BioScore.Core.Common.Auth;
using BioScore.Core.Modules.DietTracker.Interfaces;
using BioScore.Infrastructure.Auth;
using BioScore.Infrastructure.ExternalServices;
using BioScore.Infrastructure.Persistence;
using BioScore.Infrastructure.Persistence.Queries;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using IAppDbContext = BioScore.Core.Common.Interfaces.IAppDbContext;

namespace BioScore.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(config.GetConnectionString("DefaultConnection")));
            services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
            services.AddScoped<DietQueries>();
            services.AddScoped<IFoodRecognitionService, OpenAIVisionFoodAdapter>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            return services;
        }
    }
}