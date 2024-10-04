using NLog.Extensions.Logging;

namespace Beelina.API.Helpers.Extensions
{
    public static class ServiceLogExtension
    {
        public static void RegisterServiceLog(this IServiceCollection services)
        {
            services.AddLogging(loggingOptions =>
            {
                loggingOptions.ClearProviders();
                loggingOptions.AddNLog();
            });
        }
    }
}