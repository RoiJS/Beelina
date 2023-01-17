using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Payloads;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Constants;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class UserAccountMutation
    {
        [Authorize]
        [Error(typeof(UserAccountErrorFactory))]
        public async Task<UserAccount> RegisterUserAccount(
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IMapper mapper,
            UserAccountInput userAccountInput)
        {
            userAccountInput.Username = userAccountInput.Username.ToLower();

            if (await userAccountRepository.UserExists(userAccountInput.Username))
                throw new UsernameAlreadyExistsException(userAccountInput.Username);

            var userToCreate = mapper.Map<UserAccount>(userAccountInput);

            var createdUser = await userAccountRepository.Register(userToCreate, userAccountInput.Password);

            return createdUser;
        }

        [Authorize]
        [Error(typeof(UserAccountErrorFactory))]
        public async Task<UserAccount> UpdateUserAccount(
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            UserAccountInput userAccountForUpdateInput
            )
        {
            var userAccountFromRepo = await userAccountRepository.GetEntity(userAccountForUpdateInput.Id).ToObjectAsync();

            if (userAccountFromRepo == null)
                throw new UserAccountNotExistsException();

            userAccountRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            mapper.Map(userAccountForUpdateInput, userAccountFromRepo);

            if (!await userAccountRepository.SaveChanges())
                throw new BaseException("Failed to update user account!");

            return userAccountFromRepo;
        }

        [Error(typeof(UserAccountErrorFactory))]
        public async Task<LoginPayLoad> Login(
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IOptions<ApplicationSettings> appSettings,
            LoginInput loginInput)
        {
            var userFromRepo = await userAccountRepository.Login(loginInput.Username.ToLower(), loginInput.Password);

            if (userFromRepo == null)
                throw new InvalidCredentialsException();

            var accessToken = GenerateAccessToken(appSettings, userFromRepo);
            var refreshToken = userAccountRepository.GenerateNewRefreshToken();

            userFromRepo.RefreshTokens.Add(refreshToken);

            // Removed expired refresh tokens
            await userAccountRepository.RemoveExpiredRefreshTokens();

            await userAccountRepository.SaveChanges();

            return new LoginPayLoad
            {
                AccessToken = accessToken,
                ExpiresIn = refreshToken.ExpirationDate,
                RefreshToken = refreshToken.Token
            };
        }

        private string GenerateAccessToken(IOptions<ApplicationSettings> appSettings, UserAccount user)
        {
            var claims = new[] {
                new Claim (ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim (ClaimTypes.Name, user.Username),
                new Claim (BeelinaClaimTypes.FirstName, user.FirstName),
                new Claim (BeelinaClaimTypes.MiddleName, user.MiddleName),
                new Claim (BeelinaClaimTypes.LastName, user.LastName),
                new Claim (BeelinaClaimTypes.Gender, ((int)user.Gender).ToString()),
                new Claim (BeelinaClaimTypes.Username, user.Username),
                new Claim (BeelinaClaimTypes.EmailAddress, user.EmailAddress),
                new Claim (BeelinaClaimTypes.UserType, ((int)PermissionLevelEnum.Administrator).ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.Value.GeneralSettings.Token));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(5),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var createToken = tokenHandler.CreateToken(tokenDescriptor);

            var token = tokenHandler.WriteToken(createToken);

            return token;
        }

        private int GetUserIdFromAccessToken(IOptions<ApplicationSettings> appSettings, string accessToken)
        {
            var tokenValidationParamters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.Value.GeneralSettings.Token)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(accessToken, tokenValidationParamters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token!");
            }

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                throw new SecurityTokenException($"Missing claim: {ClaimTypes.NameIdentifier}!");
            }

            return Convert.ToInt32(userId);
        }

        private bool ValidateRefreshToken(UserAccount user, string refreshToken)
        {
            if (user == null ||
                !user.RefreshTokens.Exists(rt => rt.Token == refreshToken))
            {
                return false;
            }

            var storedRefreshToken = user.RefreshTokens.Find(rt => rt.Token == refreshToken);

            // Ensure that the refresh token that we got from storage is not yet expired.
            if (DateTime.UtcNow > storedRefreshToken?.ExpirationDate)
            {
                return false;
            }

            return true;
        }
    }
}
