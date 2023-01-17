using Beelina.LIB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.Interfaces
{
    public interface IClientRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Client> RegisterClient(Client client);
        Task<Client> RegisterDemo(Client client);
        Task<Client> GetCompanyInfoByName(string companyName);
    }
}
