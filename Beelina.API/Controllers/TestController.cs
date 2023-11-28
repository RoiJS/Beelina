using Beelina.LIB.Dtos;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Beelina.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IClientRepository<Client> _clientRepository;
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public TestController(
            IClientRepository<Client> clientRepository,
            IOptions<ApplicationSettings> appSettings,
            IWebHostEnvironment hostingEnvironment
        )
        {
            _appSettings = appSettings;
            _clientRepository = clientRepository;
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientForListDto>>> GetAllClients()
        {
            var clientsFromRepo = await _clientRepository.GetAllEntities().ToListObjectAsync();
            return Ok(clientsFromRepo);
        }

        [HttpGet("getTimeZonesLocal")]
        public IActionResult GetTimeZonesLocal()
        {
            var timeZones = TimeZoneInfo.Local;
            return Ok(timeZones);
        }

        [HttpGet("getTimeZones")]
        public IActionResult GetAllTimeZone()
        {
            var timeZones = TimeZoneInfo.GetSystemTimeZones();
            return Ok(timeZones);
        }

        [HttpGet("getCurrentDateTimeURL")]
        public IActionResult GetCurrentDateTime()
        {
            var currentDateTime = DateTime.Now.ConvertToTimeZone(_appSettings.Value.GeneralSettings.TimeZone);
            // var currentDateTime = new DateTime(2021, 04, 24, 15, 20, 38).ToUniversalTime();
            // currentDateTime = currentDateTime.ConvertToTimeZone(_appSettings.Value.GeneralSettings.TimeZone);
            return Ok(String.Format("{0} {1}", currentDateTime.ToLongDateString(), currentDateTime.ToLongTimeString()));
        }

        [HttpGet("testThrowErroLog")]

        public void TestThrowErroLog()
        {
            throw new Exception("Test error here!");
        }

        [HttpGet("getEnvironmentName")]

        public IActionResult GetCurrentAppEnvironment()
        {
            var environmentName = _hostingEnvironment.EnvironmentName;

            return Ok($"Current Environment: {environmentName}");
        }
    }
}