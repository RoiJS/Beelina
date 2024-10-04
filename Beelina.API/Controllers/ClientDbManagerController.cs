using AutoMapper;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Dtos;
using Beelina.LIB.Helpers.Constants;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Beelina.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientDbManagerController : BeelinaBaseController
    {
        private readonly BeelinaClientDataContext _context;
        private readonly IClientDbManagerRepository<IEntity> _clientDbManagerRepository;
        private readonly ILogger<ClientDbManagerController> _logger;
        private readonly IDataSeedRepository<IEntity> _dataSeedRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public ClientDbManagerController(
            BeelinaClientDataContext context,
            IClientDbManagerRepository<IEntity> clientDbManagerRepository,
            ILogger<ClientDbManagerController> logger,
            IDataSeedRepository<IEntity> dataSeedRepository,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper
        )
        {
            _context = context;
            _clientDbManagerRepository = clientDbManagerRepository;
            _logger = logger;
            _mapper = mapper;
            _dataSeedRepository = dataSeedRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.SyncDatabaseURL)]
        public async Task<IActionResult> SyncDatabase()
        {
            try
            {
                var appSecretToken = _httpContextAccessor.HttpContext.Request.Headers["App-Secret-Token"].ToString();
                _logger.LogInformation("Syncing database {@appSecretToken}...", appSecretToken);
                await _context.Database.MigrateAsync();
                _logger.LogInformation("Database has been successfully synced!");
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing database.");
                throw new Exception($"Error syncing database. Error Message: {ex.Message}");
            }
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.SyncAllDatabasesURL)]
        public async Task<IActionResult> SyncAllDatabases()
        {
            try
            {
                var appSecretToken = _httpContextAccessor.HttpContext.Request.Headers["App-Secret-Token"].ToString();
                _logger.LogInformation("Syncing all database {@appSecretToken}...", appSecretToken);
                await _clientDbManagerRepository.SyncAllClientDatabases();
                _logger.LogInformation("All Databases have been successfully synced!");

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing databases.");
                throw new Exception($"Error syncing databases. Error Message: {ex.Message}");
            }
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.PopulateDatabaseURL)]
        public ActionResult<UserAccount> PopulateDatabase(ClientInformationDto clientInformationDto)
        {
            var userAccount = _mapper.Map<Account>(clientInformationDto.UserAccountDto);
            var client = _mapper.Map<Client>(clientInformationDto.ClientDto);

            try
            {
                // Populate default data on the newly created database
                _logger.LogInformation("Populating client database... {@clientInformationDto}...", clientInformationDto);
                _dataSeedRepository.SeedData(userAccount, client);
                _logger.LogInformation("Client database has been successfully populated.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error populating database {clientName}", clientInformationDto.ClientDto.Name);
                throw new Exception($"Error populating database {clientInformationDto.ClientDto.Name}. Error Message: {ex.InnerException.Message}");
            }

            var userAccountDtoToReturn = _mapper.Map<UserAccountDto>(userAccount);

            return Ok(userAccountDtoToReturn);
        }
    }
}