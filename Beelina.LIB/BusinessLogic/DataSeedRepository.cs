using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Class;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using RestSharp;

namespace Beelina.LIB.BusinessLogic
{
    public class DataSeedRepository
        : BaseRepository<IEntity>, IDataSeedRepository<IEntity>
    {
        public BeelinaClientDataContext _context;
        private readonly IConfiguration _configuration;
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly IOptions<AppHostInfo> _appHostInfo;
        private readonly IOptions<AppSettingsURL> _appSettingsUrl;

        public DataSeedRepository(IBeelinaRepository<IEntity> reserbizRepository,
            IConfiguration configuration,
            IOptions<ApplicationSettings> appSettings,
            IOptions<AppHostInfo> appHostInfo,
            IOptions<AppSettingsURL> appSettingsUrl)
            : base(reserbizRepository, reserbizRepository.ClientDbContext)
        {
            _appSettings = appSettings;
            _appHostInfo = appHostInfo;
            _appSettingsUrl = appSettingsUrl;
            _configuration = configuration;
            _context = reserbizRepository.ClientDbContext;
        }

        public void SeedData(Account account, Client client)
        {
            switch (client.Type)
            {
                case ClientTypeEnum.Demo:
                    SeedAccounts(account);
                    break;
                case ClientTypeEnum.Regular:
                    SeedAccounts(account);
                    break;
            }
        }

        private void SeedAccounts(Account account)
        {
            var defaultUsername = GenerateUsername(account);
            var defaultPassword = GeneratePassword();

            account.Username = defaultUsername;
            account.Password = defaultPassword;

            byte[] passwordHash, passwordSalt;

            SystemUtility.EncryptionUtility.CreatePasswordHash(defaultPassword, out passwordHash, out passwordSalt);

            if (!_context.UserAccounts.Any())
            {
                _context.UserAccounts.Add(
                     new UserAccount
                     {
                         FirstName = account.FirstName,
                         MiddleName = account.MiddleName,
                         LastName = account.LastName,
                         Gender = GenderEnum.Male,
                         PhotoUrl = "",
                         Username = defaultUsername,
                         PasswordHash = passwordHash,
                         PasswordSalt = passwordSalt,
                         EmailAddress = account.EmailAddress,
                         UserPermissions = new List<UserPermission> {
                            new UserPermission {
                                ModuleId = ModulesEnum.Retail,
                                PermissionLevel = PermissionLevelEnum.Administrator
                            }
                         }
                     }
                 );

                _context.SaveChanges();
            }
        }

        // private void SeedSettings(Client client)
        // {
        //     if (!_context.ClientSettings.Any())
        //     {
        //         _context.ClientSettings.Add(new ClientSettings
        //         {
        //             BusinessName = client.Name
        //         });

        //         _context.SaveChanges();
        //     }
        // }
        
        private string GenerateUsername(Account account)
        {
            var username = String.Format("{0}{1}", account.FirstName.ToLower().Substring(0, 2), account.LastName.ToLower().Substring(0, 2));
            return username;
        }

        private string GeneratePassword()
        {
            // For now this will be the default password
            return "Starta123";
        }
    }
}