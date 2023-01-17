using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class UserAccount
        : Person, IUserActionTracker
    {
        public string Username { get; set; } = String.Empty;
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public string EmailAddress { get; set; } = String.Empty;

        public List<RefreshToken> RefreshTokens { get; set; }
        public List<UserPermission> UserPermissions { get; set; }

        #region User Accounts Tracker
        public List<UserAccount> DeletedAccounts { get; set; }
        public List<UserAccount> UpdatedAccounts { get; set; }
        public List<UserAccount> CreatedAccounts { get; set; }
        public List<UserAccount> DeactivatedAccounts { get; set; }
        #endregion

        public int? DeletedById { get; set; }
        public virtual UserAccount DeletedBy { get; set; }
        public int? UpdatedById { get; set; }
        public virtual UserAccount UpdatedBy { get; set; }
        public int? CreatedById { get; set; }
        public virtual UserAccount CreatedBy { get; set; }
        public int? DeactivatedById { get; set; }
        public virtual UserAccount DeactivatedBy { get; set; }
    }
}
