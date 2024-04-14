using Beelina.LIB.Helpers.Constants;
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

        public string AppSecretToken
        {
            get
            {
                var appSecretToken = _claimsPrincipal.Identity.GetUserClaim(BeelinaClaimTypes.AppSecretToken).ToString();
                return appSecretToken;
            }
        }
        
        public int CurrentUserId
        {
            get
            {
                var userId = Convert.ToInt32(_claimsPrincipal.Identity.GetUserClaim(ClaimTypes.NameIdentifier));
                return userId;
            }
        }

        public string CurrrentUserEmailAddress
        {
            get
            {
                return Convert.ToString(_claimsPrincipal.Identity.GetUserClaim(BeelinaClaimTypes.EmailAddress));
            }
        }

        public string CurrrentName
        {
            get
            {
                return Convert.ToString(_claimsPrincipal.Identity.GetUserClaim(BeelinaClaimTypes.FirstName));
            }
        }
    }
}
