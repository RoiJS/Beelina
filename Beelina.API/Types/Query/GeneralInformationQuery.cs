using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class GeneralInformationQuery
    {
        public async Task<GeneralInformation> GetGeneralInformation([Service] IGeneralInformationRepository<GeneralInformation> generalInformationRepository)
        {
            return await generalInformationRepository.GetGeneralInformation();
        }
    }
}
