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
        [UsePaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        public async Task<IList<UserAccount>> GetUserAccounts(
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            string filterKeyword = ""
        )
        {
            return await userAccountRepository.GetUserAccounts(0, filterKeyword, httpContextAccessor.HttpContext.RequestAborted);
        }

        [Authorize]
        public async Task<IUserAccountPayload> GetUserAccount(
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] IMapper mapper,
            int userId)
        {
            var userAccountFromRepo = await userAccountRepository.GetUserAccounts(userId, "", httpContextAccessor.HttpContext.RequestAborted);

            if (userAccountFromRepo == null || userAccountFromRepo.Count == 0)
            {
                return new UserAccountNotExistsError();
            }

            var userAccountResult = mapper.Map<UserAccountInformationResult>(userAccountFromRepo[0]);
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
