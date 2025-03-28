using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Constants;
using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;

namespace Beelina.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly IClientRepository<Client> _clientRepository;
        private readonly ILogger<ClientsController> _logger;
        private readonly IMapper _mapper;
        private readonly IOptions<DbUserAccountDefaultsSettings> _dbUserAccountDefaultSettings;

        public ClientsController(
            IClientRepository<Client> clientRepository,
            ILogger<ClientsController> logger,
            IOptions<DbUserAccountDefaultsSettings> dbUserAccountDefaultSettings,
            IMapper mapper
        )
        {
            _clientRepository = clientRepository;
            _logger = logger;
            _dbUserAccountDefaultSettings = dbUserAccountDefaultSettings;
            _mapper = mapper;
        }

        [HttpPost(ApiRoutes.ClientsControllerRoutes.RegisterClientURL)]
        public async Task<IActionResult> RegisterClient(ClientForRegisterDto clientForRegisterDto)
        {
            var clientToCreate = new Client
            {
                Name = clientForRegisterDto.Name,
                Type = ClientTypeEnum.Regular,
                Description = clientForRegisterDto.Description,
                ContactNumber = clientForRegisterDto.ContactNumber,
                DateJoined = DateTime.Now,
                DBServer = _dbUserAccountDefaultSettings.Value.DbServer,
                DBusername = _dbUserAccountDefaultSettings.Value.DbUsername,
                DBPassword = _dbUserAccountDefaultSettings.Value.DbPassword,
            };

            var userAccount = new Account
            {
                FirstName = clientForRegisterDto.FirstName,
                MiddleName = clientForRegisterDto.MiddleName,
                LastName = clientForRegisterDto.LastName,
                EmailAddress = clientForRegisterDto.EmailAddress
            };

            try
            {
                _logger.LogInformation("Registering new client... {@clientForRegisterDto}", clientForRegisterDto);
                // Save client information
                var createdClient = await _clientRepository.RegisterClient(clientToCreate);

                _logger.LogInformation("Creating new database...");
                // Create client database
                await _clientRepository.CreateClientDatabase(createdClient);

                _logger.LogInformation("Populating new database...");
                // Populate default data on the client database
                await _clientRepository.PopulateDatabase(userAccount, createdClient, (Account account) =>
                {
                    if (clientForRegisterDto.AutoSendEmail)
                    {
                        // Send email notification after database has been successfully created
                        _clientRepository.SendNewClientRegisteredEmailNotification(account, createdClient);
                    }
                });
                _logger.LogInformation("New client successfully created. {@createdClient}", createdClient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new client account. Params: {@params}", clientForRegisterDto);
                throw new Exception($"Error on creating client database. Error message: {ex.InnerException.Message}");
            }

            return StatusCode(201);
        }

        [HttpPost(ApiRoutes.ClientsControllerRoutes.RegisterDemoURL)]
        public async Task<IActionResult> RegisterDemo(DemoForRegisterDto demoForRegisterDto)
        {
            var demoToCreate = new Client
            {
                Name = demoForRegisterDto.Name,
                Type = ClientTypeEnum.Demo,
                ContactNumber = demoForRegisterDto.ContactNumber,
                DateJoined = DateTime.Now,
                DBServer = _dbUserAccountDefaultSettings.Value.DbServer,
                DBusername = _dbUserAccountDefaultSettings.Value.DbUsername,
                DBPassword = _dbUserAccountDefaultSettings.Value.DbPassword,
            };

            var userAccount = new Account
            {
                FirstName = demoForRegisterDto.FirstName,
                MiddleName = demoForRegisterDto.MiddleName,
                LastName = demoForRegisterDto.LastName,
                EmailAddress = demoForRegisterDto.EmailAddress
            };

            try
            {
                _logger.LogInformation("Registering new demo account... {@demoForRegisterDto}", demoForRegisterDto);

                // Save client information
                var createdDemoClient = await _clientRepository.RegisterDemo(demoToCreate);

                _logger.LogInformation("Creating new demo database...");
                // Create demo database
                await _clientRepository.CreateClientDatabase(createdDemoClient);

                _logger.LogInformation("Populating new demo database...");
                // Populate default data on the demo database
                await _clientRepository.PopulateDatabase(userAccount, createdDemoClient, (Account account) =>
                {
                    if (demoForRegisterDto.AutoSendEmail)
                    {
                        // Send email notification after database has been successfully created
                        _clientRepository.SendNewDemoRegisteredEmailNotification(account, createdDemoClient);
                    }
                });
                _logger.LogInformation("New demo account successfully created. {@createdDemoClient}", createdDemoClient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new demo account. Params: {@params}", demoForRegisterDto);
                throw new Exception($"Error on creating demo database. Error message: {ex.InnerException.Message}");
            }

            return StatusCode(201);
        }

        [HttpDelete(ApiRoutes.ClientsControllerRoutes.DeleteClientURL)]
        public async Task<ActionResult<ClientDetailsDto>> DeleteClient(int id)
        {
            _logger.LogInformation("Deleting client with an id of {id}...", id);
            var clientFromRepo = await _clientRepository.GetEntity(id).ToObjectAsync();

            if (clientFromRepo == null)
            {
                _logger.LogError("Client does not exists.");
                return NotFound("Client does not exists.");
            }

            _clientRepository.DeleteEntity(clientFromRepo);

            var clientToReturn = _mapper.Map<ClientDetailsDto>(clientFromRepo);

            if (await _clientRepository.SaveChanges())
            {
                _logger.LogInformation("Successfully deleted client.");
                return Ok(clientToReturn);
            }

            _logger.LogError("Deleting client with an id of {id} failed on save.", id);
            throw new Exception($"Deleting client with an id of {id} failed on save.");
        }

        [HttpPut(ApiRoutes.ClientsControllerRoutes.UpdateClientURL)]
        public async Task<IActionResult> UpdateClient(int id, ClientForUpdateDto clientForUpdateDto)
        {
            _logger.LogInformation("Updating client... {@clientForUpdateDto}", clientForUpdateDto);
            var clientFromRepo = await _clientRepository.GetEntity(id).ToObjectAsync();

            if (clientFromRepo == null)
            {
                _logger.LogError("Client does not exists.");
                return NotFound("Client does not exists.");
            }

            _mapper.Map(clientForUpdateDto, clientFromRepo);

            if (!_clientRepository.HasChanged())
            {
                _logger.LogError("Nothing was change.");
                return BadRequest("Nothing was change.");
            }

            if (await _clientRepository.SaveChanges())
            {
                _logger.LogInformation("Successfully updated client.");
                return NoContent();
            }

            _logger.LogError("Updating client with an id of {id} failed on save.", id);
            throw new Exception($"Updating client with an id of {id} failed on save.");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientForListDto>>> GetAllClients()
        {
            var clientsFromRepo = await _clientRepository.GetAllEntities().ToListObjectAsync();
            var clietsToReturn = _mapper.Map<IEnumerable<ClientForListDto>>(clientsFromRepo);
            return Ok(clietsToReturn);
        }
    }
}