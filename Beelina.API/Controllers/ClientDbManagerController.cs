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
        private readonly IDataSeedRepository<IEntity> _dataSeedRepository;
        private readonly IMapper _mapper;

        public ClientDbManagerController(
            BeelinaClientDataContext context,
            IClientDbManagerRepository<IEntity> clientDbManagerRepository,
            IDataSeedRepository<IEntity> dataSeedRepository,
            IMapper mapper
        )
        {
            _context = context;
            _clientDbManagerRepository = clientDbManagerRepository;
            _mapper = mapper;
            _dataSeedRepository = dataSeedRepository;
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.SyncDatabaseURL)]
        public async Task<IActionResult> SyncDatabase()
        {
            await _context.Database.MigrateAsync();
            return Ok();
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.SyncAllDatabasesURL)]
        public async Task<IActionResult> SyncAllDatabases()
        {
            await _clientDbManagerRepository.SyncAllClientDatabases();
            return Ok();
        }

        [HttpPost(ApiRoutes.ClientDbManagerControllerRoutes.PopulateDatabaseURL)]
        public ActionResult<UserAccount> PopulateDatabase(ClientInformationDto clientInformationDto)
        {
            var userAccount = _mapper.Map<Account>(clientInformationDto.UserAccountDto);
            var client = _mapper.Map<Client>(clientInformationDto.ClientDto);

            try
            {
                // Populate default data on the newly created database
                _dataSeedRepository.SeedData(userAccount, client);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error populating database {clientInformationDto.ClientDto.Name}. Error Message: {ex.InnerException.Message}");
            }

            var userAccountDtoToReturn = _mapper.Map<UserAccountDto>(userAccount);

            return Ok(userAccountDtoToReturn);
        }
    }
}