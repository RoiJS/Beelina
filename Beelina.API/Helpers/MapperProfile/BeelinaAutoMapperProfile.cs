using AutoMapper;
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
        }
    }
}
