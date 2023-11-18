using AutoMapper;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
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

        [Authorize]
        public async Task<IUserAccountPayload> GetUserAccount([Service] IUserAccountRepository<UserAccount> userAccountRepository, [Service] IMapper mapper, int userId)
        {
            var userAccountFromRepo = await userAccountRepository
                                        .GetEntity(userId)
                                        .Includes(u => u.UserPermissions)
                                        .ToObjectAsync();

            var userAccountResult = mapper.Map<UserAccountInformationResult>(userAccountFromRepo);

            if (userAccountFromRepo == null)
            {
                return new UserAccountNotExistsError();
            }

            return userAccountResult;
        }

        [Authorize]
        public async Task<IUserAccountPayload> VerifyUserAccount([Service] IUserAccountRepository<UserAccount> userAccountRepository, [Service] IMapper mapper, LoginInput loginInput)
        {
            var userAccountFromRepo = await userAccountRepository.Login(loginInput.Username.ToLower(), loginInput.Password);

            var userAccountResult = mapper.Map<UserAccountInformationResult>(userAccountFromRepo);

            if (userAccountFromRepo == null)
            {
                return new UserAccountNotExistsError();
            }

            return userAccountResult;
        }

        [Authorize]
        public async Task<IUserAccountPayload> CheckUsername([Service] IUserAccountRepository<UserAccount> userAccountRepository, int userId, string username)
        {
            var usernameExists = await userAccountRepository.UserExists(username, userId);
            return new CheckUsernameInformationResult(usernameExists);
        }

        [Authorize]
        public async Task<List<UserAccount>> GetSalesAgents([Service] IUserAccountRepository<UserAccount> userAccountRepository)
        {
            return await userAccountRepository.GetAllSalesAgents();
        }
    }
}
