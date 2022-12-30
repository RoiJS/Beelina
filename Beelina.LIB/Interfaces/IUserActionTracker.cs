using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IUserActionTracker
    {
        int? DeletedById { get; set; }
        UserAccount DeletedBy { get; set; }
        int? UpdatedById { get; set; }
        UserAccount UpdatedBy { get; set; }
        int? CreatedById { get; set; }
        UserAccount CreatedBy { get; set; }
        int? DeactivatedById { get; set; }
        UserAccount DeactivatedBy { get; set; }
    }
}
