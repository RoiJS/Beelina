using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Security.Principal;

namespace Beelina.LIB.BusinessLogic
{
    public class UserPermissionRepository
        : BaseRepository<UserPermission>, IUserPermissionRepository<UserPermission>
    {

        public UserPermissionRepository(IBeelinaRepository<UserPermission> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public Task<UserPermission> Register(int userAccountId, List<UserPermission> userPermissions)
        {
            throw new NotImplementedException();
        }
    }
}
