using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class UserPermission
            : Entity
    {
        public int UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }
        public ModulesEnum ModuleId { get; set; }
        public PermissionLevelEnum PermissionLevel { get; set; } = PermissionLevelEnum.User;
    }
}
