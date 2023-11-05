using AutoMapper;
using Beelina.LIB.Dtos;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;

namespace Beelina.API.Helpers.MapperProfile
{
    public class BeelinaAutoMapperProfile : Profile
    {
        public BeelinaAutoMapperProfile()
        {
            CreateMap<UserAccountInput, UserAccount>();
            CreateMap<UserPermissionInput, UserPermission>();
            CreateMap<ProductInput, Product>();
            CreateMap<ProductUnitInput, ProductUnit>();
            CreateMap<TransactionInput, Transaction>();
            CreateMap<ProductTransactionInput, ProductTransaction>();
            CreateMap<StoreInput, Store>();
            CreateMap<PaymentMethodInput, PaymentMethod>();
            CreateMap<BarangayInput, Barangay>();

            CreateMap<Client, ClientInformationResult>();
            CreateMap<Store, StoreInformationResult>();
            CreateMap<Product, ProductInformationResult>();
            CreateMap<Report, ReportInformationResult>();

            CreateMap<Client, ClientForListDto>();
            CreateMap<Client, ClientDetailsDto>();
            CreateMap<ClientForUpdateDto, Client>();
            CreateMap<UserAccountDto, Account>();
            CreateMap<Account, UserAccountDto>();
            CreateMap<ClientDto, Client>();
        }
    }
}
