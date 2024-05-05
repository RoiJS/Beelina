using Beelina.LIB.Enums;

namespace Beelina.LIB.Interfaces
{
    public interface ICurrentUserService
    {
        string AppSecretToken { get; }
        int CurrentUserId { get; }
        string CurrrentUserEmailAddress { get; }
        string CurrrentName { get; }
        BusinessModelEnum CurrrentBusinessModel { get; }
    }
}
