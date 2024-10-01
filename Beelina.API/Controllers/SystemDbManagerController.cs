using Beelina.LIB.DbContexts;
using Beelina.LIB.Helpers.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Beelina.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemDbManagerController : BeelinaBaseController
    {
        private readonly BeelinaDataContext _context;
        private readonly ILogger<SystemDbManagerController> _logger;

        public SystemDbManagerController(
            BeelinaDataContext context, 
            ILogger<SystemDbManagerController> logger
        )
        {
            _logger = logger;
            _context = context;
        }

        [HttpPost(ApiRoutes.SystemDbManagerControllerRoutes.SyncDatabaseURL)]
        public async Task<IActionResult> SyncDatabase()
        {
            try
            {
                _logger.LogInformation("Syncing System Database...");
                await _context.Database.MigrateAsync();
                _logger.LogInformation("System Database has been successfully synced!");

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing system database.");
                throw new Exception($"Error syncing system database. Error Message: {ex.Message}");
            }
        }
    }
}