namespace Beelina.LIB.Interfaces
{
    public interface ICurrentUserService
    {
        int CurrentUserId { get; }
        string CurrrentUserEmailAddress { get; }
        string CurrrentName { get; }
    }
}
