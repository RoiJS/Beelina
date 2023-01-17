using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using System.Security.Claims;

namespace Beelina.LIB.Helpers.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly ClaimsPrincipal _claimsPrincipal;

        public CurrentUserService(ClaimsPrincipal claimsPrincipal)
        {
            _claimsPrincipal = claimsPrincipal;
        }

        public int CurrentUserId
        {
            get {
                var userId = Convert.ToInt32(_claimsPrincipal.Identity.GetUserClaim(ClaimTypes.NameIdentifier));
                return userId;
            }
        }
    }
}
