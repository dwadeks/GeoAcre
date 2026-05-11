var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddHttpClient<SteelTree.GeoAcre.Web.Api.Services.IGeocodeService, SteelTree.GeoAcre.Web.Api.Services.NominatimGeocodeService>();

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
