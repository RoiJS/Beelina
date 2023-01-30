using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class TransactionMutation
    {
        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Transaction> RegisterTransaction(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] IMapper mapper,
            TransactionInput transactionInput)
        {
            var transactionToCreate = mapper.Map<Transaction>(transactionInput);

            await transactionRepository.RegisterTransaction(transactionToCreate);

            return transactionToCreate;
        }
    }
}
