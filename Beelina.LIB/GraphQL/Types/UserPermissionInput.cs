using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class UserPermissionInput
    {
        public ModulesEnum ModuleId { get; set; }
        public PermissionLevelEnum PermissionLevel { get; set; } = PermissionLevelEnum.User;
    }
}
