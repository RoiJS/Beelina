using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IGeneralInformationRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<GeneralInformation> GetGeneralInformation();
    }
}