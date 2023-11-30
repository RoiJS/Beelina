using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class GeneralInformationRepository
        : BaseRepository<GeneralInformation>, IGeneralInformationRepository<GeneralInformation>
    {
        public GeneralInformationRepository(IBeelinaRepository<GeneralInformation> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
        }

        public async Task<GeneralInformation> GetGeneralInformation()
        {
            var generalInformationFromRepo = await GetAllEntities().ToListObjectAsync();
            return generalInformationFromRepo.Count > 0 ? generalInformationFromRepo[0] : null;
        }
    }
}