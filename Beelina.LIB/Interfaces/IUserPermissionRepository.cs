using Beelina.LIB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.Interfaces
{
    public interface IUserPermissionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<UserPermission> Register(int userAccountId, List<UserPermission> userPermissions);
    }
}
