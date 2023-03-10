using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class UserAccountQuery
    {
        [Authorize]
        [UsePaging]
        [UseProjection]
        public async Task<IList<UserAccount>> GetUserAccounts([Service] IUserAccountRepository<UserAccount> userAccountRepository) => await userAccountRepository.GetAllEntities().ToListObjectAsync();
    }
}
