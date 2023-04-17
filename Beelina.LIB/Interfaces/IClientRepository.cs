using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IClientRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
         Task<Client> RegisterClient(Client client);
        Task<Client> RegisterDemo(Client client);
        Task<Client> GetCompanyInfoByName(string companyName);
        Task CreateClientDatabase(Client client);
        Task PopulateDatabase(Account account, Client client, Action<Account> sendEmaiNotification);
        void SendNewClientRegisteredEmailNotification(Account account, Client client);
        void SendNewDemoRegisteredEmailNotification(Account account, Client client);
    }
}
