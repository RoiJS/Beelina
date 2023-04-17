using System.Security.Claims;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Constants;
using Beelina.LIB.Helpers.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace Beelina.API.Controllers
{
    public class BeelinaBaseController : ControllerBase
    {
        public int CurrentUserId
        {
            get
            {
                return Convert.ToInt32(User.Identity.GetUserClaim(ClaimTypes.NameIdentifier));
            }
        }

        public UserTypeEnum CurrentUserType
        {
            get
            {
                return ((UserTypeEnum)Convert.ToInt32(User.Identity.GetUserClaim(BeelinaClaimTypes.UserType)));
            }
        }
    }
}