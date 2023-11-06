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

        public SystemDbManagerController(BeelinaDataContext context)
        {
            _context = context;
        }

        [HttpPost(ApiRoutes.SystemDbManagerControllerRoutes.SyncDatabaseURL)]
        public async Task<IActionResult> SyncDatabase()
        {
            await _context.Database.MigrateAsync();
            return Ok();
        }
    }
}