using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ProductInformationResult : Product, IProductPayload
    {
        public double DefaultPrice { get; set; }
        public int StocksRemainingFromWarehouse { get; set; }
    }
}