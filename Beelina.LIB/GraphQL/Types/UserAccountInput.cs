
using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class UserAccountInput
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string MiddleName { get; set; }

        public string LastName { get; set; }

        public string Username { get; set; }

        public string EmailAddress { get; set; }

        public string NewPassword { get; set; }

        public SalesAgentTypeEnum SalesAgentType { get; set; } = SalesAgentTypeEnum.None;

        public List<UserPermissionInput> UserPermissions { get; set; }
    }
}
