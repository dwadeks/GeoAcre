using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geocoding.ProviderAdapters;
using SteelTree.GeoAcre.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add HTTP client for geocoding
builder.Services.AddHttpClient<IGeocodeService, NominatimGeocodeService>();

builder.Services.Configure<LegalDescriptionProviderOptions>(
    builder.Configuration.GetSection("LegalDescriptionProviders"));
builder.Services.AddSingleton<ILegalDescriptionOcrService, PlaceholderLegalDescriptionOcrService>();
builder.Services.AddSingleton<ILegalDescriptionInterpreter, PlaceholderLegalDescriptionInterpreter>();
builder.Services.AddSingleton<ILegalDescriptionBoundaryMapper, LegalDescriptionBoundaryMapper>();
builder.Services.AddScoped<ILegalDescriptionService, LegalDescriptionService>();

// Add logging
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add error handling middleware
app.UseMiddleware<SteelTree.GeoAcre.Web.Api.Middleware.ErrorHandlingMiddleware>();
app.UseMiddleware<SteelTree.GeoAcre.Web.Api.Middleware.RateLimitingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run("http://localhost:5000");

public partial class Program { }
