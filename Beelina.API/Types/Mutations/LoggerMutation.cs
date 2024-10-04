using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class LoggerMutation
    {
        [Authorize]
        public bool LogMessage(
            [Service] ILogger<LoggerMutation> logger,
            LogLevel logLevel,
            string message)
        {
            logger.Log(logLevel, message);
            return true;
        }
    }
}