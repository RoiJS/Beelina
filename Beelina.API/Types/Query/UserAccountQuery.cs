using Beelina.LIB.DbContexts;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class UserAccountQuery
    {
        [UsePaging(IncludeTotalCount = true)]
        [UseProjection]
        public async Task<IList<UserAccount>> GetUserAccounts([Service] IUserAccountRepository<UserAccount> userAccountRepository) => await userAccountRepository.GetAllEntities().ToListObjectAsync();
    }
}
