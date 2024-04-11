using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Payloads;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Constants;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
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

            var createdUser = await userAccountRepository.Register(userToCreate, userAccountInput.NewPassword);

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
            var userAccountFromRepo = await userAccountRepository
                        .GetEntity(userAccountForUpdateInput.Id)
                        .Includes(u => u.UserPermissions)
                        .ToObjectAsync();

            if (userAccountFromRepo == null)
                throw new UserAccountNotExistsException();

            userAccountRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            mapper.Map(userAccountForUpdateInput, userAccountFromRepo);

            // Check if user has new password   
            if (!String.IsNullOrEmpty(userAccountForUpdateInput.NewPassword))
            {
                var encryptedNewPassword = userAccountRepository.GenerateNewPassword(userAccountForUpdateInput.NewPassword);
                userAccountFromRepo.PasswordHash = encryptedNewPassword.PasswordHash;
                userAccountFromRepo.PasswordSalt = encryptedNewPassword.PasswordSalt;
            }

            if (!await userAccountRepository.SaveChanges())
                throw new BaseException("Failed to update user account!");

            return userAccountFromRepo;
        }

        [Error(typeof(UserAccountErrorFactory))]
        public async Task<AuthenticationPayLoad> Login(
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IGeneralInformationRepository<GeneralInformation> generalInformationRepository,
            [Service] IGeneralSettingRepository<GeneralSetting> generalSettingRepository,
            [Service] IOptions<ApplicationSettings> appSettings,
            LoginInput loginInput)
        {
            var userFromRepo = await userAccountRepository.Login(loginInput.Username.ToLower(), loginInput.Password);

            if (userFromRepo == null)
                throw new InvalidCredentialsException();

            var generalInformation = await generalInformationRepository.GetGeneralInformation();

            if (generalInformation.SystemUpdateStatus)
                throw new SystemUpdateActiveException();

            var generalSetting = await generalSettingRepository.GetGeneralSettings();
            var appSecretToken = httpContextAccessor.HttpContext.Request.Headers["App-Secret-Token"].ToString();
            var accessToken = GenerateAccessToken(appSettings, generalSetting, userFromRepo, appSecretToken);
            var refreshToken = userAccountRepository.GenerateNewRefreshToken();

            userFromRepo.RefreshTokens.Add(refreshToken);

            // Removed expired refresh tokens
            await userAccountRepository.RemoveExpiredRefreshTokens();

            await userAccountRepository.SaveChanges();

            return new AuthenticationPayLoad
            {
                AccessToken = accessToken,
                ExpiresIn = refreshToken.ExpirationDate,
                RefreshToken = refreshToken.Token
            };
        }

        [Error(typeof(UserAccountErrorFactory))]
        public async Task<AuthenticationPayLoad> Refresh(
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] IOptions<ApplicationSettings> appSettings,
            [Service] IUserAccountRepository<UserAccount> userAccountRepository,
            [Service] IRefreshTokenRepository<RefreshToken> refreshTokenRepository,
            [Service] IGeneralSettingRepository<GeneralSetting> generalSettingRepository,
            RefreshAccountInput refreshAccountInput)
        {
            var userId = GetUserIdFromAccessToken(appSettings, refreshAccountInput.AccessToken);

            var userFromRepo = await userAccountRepository
                    .GetEntity(userId)
                    .Includes(
                        a => a.RefreshTokens,
                        a => a.UserPermissions
                    )
                    .ToObjectAsync();

            if (userFromRepo == null)
            {
                throw new UserAccountNotExistsException();
            }

            if (!ValidateRefreshToken(userFromRepo, refreshAccountInput.RefreshToken))
            {
                throw new InvalidRefreshTokenException();
            }
            
            var generalSetting = await generalSettingRepository.GetGeneralSettings();
            var appSecretToken = httpContextAccessor.HttpContext.Request.Headers["App-Secret-Token"].ToString();
            var newAccessToken = GenerateAccessToken(appSettings, generalSetting, userFromRepo, appSecretToken);
            var userRefreshTokenFromRepo = await refreshTokenRepository.GetRefreshToken(refreshAccountInput.RefreshToken);
            var newRefreshToken = userAccountRepository.GenerateNewRefreshToken();

            userFromRepo.RefreshTokens.Add(newRefreshToken);

            if (!await userAccountRepository.SaveChanges())
            {
                throw new BaseException($"Updating account refresh token failed on save!");
            }

            return new AuthenticationPayLoad
            {
                AccessToken = newAccessToken,
                ExpiresIn = newRefreshToken.ExpirationDate,
                RefreshToken = newRefreshToken.Token
            };
        }

        private string GenerateAccessToken(IOptions<ApplicationSettings> appSettings, GeneralSetting generalSetting, UserAccount user, string appSecretToken)
        {
            var retailModulePrivilege = user.UserPermissions.Where(u => u.ModuleId == ModulesEnum.Retail).FirstOrDefault();

            var claims = new List<Claim> {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new (BeelinaClaimTypes.AppSecretToken, appSecretToken),
                new (ClaimTypes.Name, user.Username),
                new (BeelinaClaimTypes.FirstName, user.FirstName),
                new (BeelinaClaimTypes.MiddleName, user.MiddleName),
                new (BeelinaClaimTypes.LastName, user.LastName),
                new (BeelinaClaimTypes.Gender, ((int)user.Gender).ToString()),
                new (BeelinaClaimTypes.Username, user.Username),
                new (BeelinaClaimTypes.EmailAddress, user.EmailAddress),
                new (BeelinaClaimTypes.BusinessModel, ((int)generalSetting.BusinessModel).ToString()),
            };

            if (retailModulePrivilege is not null)
            {
                claims.Add(new(BeelinaClaimTypes.RetailModulePrivilege, Enum.GetName(typeof(PermissionLevelEnum), retailModulePrivilege.PermissionLevel) ?? String.Empty));
            }

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
