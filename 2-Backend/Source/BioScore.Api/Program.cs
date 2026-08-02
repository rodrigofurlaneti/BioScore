using BioScore.Api.Endpoints;
using BioScore.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Adiciona as injeções de dependência da Infraestrutura
builder.Services.AddInfrastructure(builder.Configuration);

// Add Swagger para testes locais
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Mapeia os endpoints do nosso Módulo de Dieta
app.MapDietEndpoints();

app.Run();