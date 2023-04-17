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
        private readonly IMapper _mapper;
        // private readonly IGeneralInformationRepository<GeneralInformation> _generalInformationRepository;
        private readonly IOptions<DbUserAccountDefaultsSettings> _dbUserAccountDefaultSettings;

        public ClientsController(
            IClientRepository<Client> clientRepository,
            // IGeneralInformationRepository<GeneralInformation> generalInformationRepository,
            IOptions<DbUserAccountDefaultsSettings> dbUserAccountDefaultSettings,
            IMapper mapper
        )
        {
            _clientRepository = clientRepository;
            _dbUserAccountDefaultSettings = dbUserAccountDefaultSettings;
            // _generalInformationRepository = generalInformationRepository;
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
                // Save client information
                var createdClient = await _clientRepository.RegisterClient(clientToCreate);

                // Create client database
                await _clientRepository.CreateClientDatabase(createdClient);

                // Populate default data on the client database
                await _clientRepository.PopulateDatabase(userAccount, createdClient, (Account account) =>
                {
                    if (clientForRegisterDto.AutoSendEmail)
                    {
                        // Send email notification after database has been successfully created
                        _clientRepository.SendNewClientRegisteredEmailNotification(account, createdClient);
                    }
                });

            }
            catch (Exception ex)
            {
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
                // Save client information
                var createdDemoClient = await _clientRepository.RegisterDemo(demoToCreate);

                // Create demo database
                await _clientRepository.CreateClientDatabase(createdDemoClient);

                // Populate default data on the demo database
                await _clientRepository.PopulateDatabase(userAccount, createdDemoClient, (Account account) =>
                {
                    if (demoForRegisterDto.AutoSendEmail)
                    {
                        // Send email notification after database has been successfully created
                        _clientRepository.SendNewDemoRegisteredEmailNotification(account, createdDemoClient);
                    }
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error on creating demo database. Error message: {ex.InnerException.Message}");
            }

            return StatusCode(201);
        }

        [HttpDelete(ApiRoutes.ClientsControllerRoutes.DeleteClientURL)]
        public async Task<ActionResult<ClientDetailsDto>> DeleteClient(int id)
        {
            var clientFromRepo = await _clientRepository.GetEntity(id).ToObjectAsync();

            if (clientFromRepo == null)
                return NotFound("Client does not exists.");

            _clientRepository.DeleteEntity(clientFromRepo);

            var clientToReturn = _mapper.Map<ClientDetailsDto>(clientFromRepo);

            if (await _clientRepository.SaveChanges())
                return Ok(clientToReturn);

            throw new Exception($"Deleting client with an id of {id} failed on save.");
        }

        // [HttpGet(ApiRoutes.ClientsControllerRoutes.GetClientInformationURL)]
        // public async Task<ActionResult<ClientDetailsDto>> GetClientInformation(string clientName)
        // {
        //     var clientInfo = await _clientRepository.GetCompanyInfoByName(clientName);

        //     if (clientInfo == null)
        //         return BadRequest("Company does not exists.");

        //     var generalInformation = await _generalInformationRepository.GetGeneralInformation();

        //     if (generalInformation.SystemUpdateStatus)
        //         return BadRequest("System is locked and currently undergoing maintenance. Please comeback later.");

        //     var clientInfoToReturn = _mapper.Map<ClientDetailsDto>(clientInfo);

        //     return Ok(clientInfoToReturn);
        // }

        [HttpPut(ApiRoutes.ClientsControllerRoutes.UpdateClientURL)]
        public async Task<IActionResult> UpdateClient(int id, ClientForUpdateDto clientForUpdateDto)
        {
            var clientFromRepo = await _clientRepository.GetEntity(id).ToObjectAsync();

            if (clientFromRepo == null)
                return NotFound("Client does not exists.");

            _mapper.Map(clientForUpdateDto, clientFromRepo);

            if (!_clientRepository.HasChanged())
                return BadRequest("Nothing was change.");

            if (await _clientRepository.SaveChanges())
                return NoContent();

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