using NLog;

public class LoggingScopeMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LoggingScopeMiddleware(RequestDelegate next, IHttpContextAccessor httpContextAccessor)
    {
        _next = next;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var appSecretToken = httpContext?.Request.Headers["App-Secret-Token"].ToString();

        // Push properties into the logging scope
        using (ScopeContext.PushProperty("appSecretToken", appSecretToken))
        {
            await _next(context); // Call the next middleware in the pipeline
        }
    }
}