using Beelina.LIB.Enums;
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
        public SalesAgentTypeEnum SalesAgentType { get; set; } = SalesAgentTypeEnum.None; // This property is used only when the Distribution module permission of the user is set to "User".

        public List<RefreshToken> RefreshTokens { get; set; }
        public List<UserPermission> UserPermissions { get; set; }
        public UserSetting UserSetting { get; set; }

        #region User Accounts Tracker
        public List<UserAccount> DeletedAccounts { get; set; }
        public List<UserAccount> UpdatedAccounts { get; set; }
        public List<UserAccount> CreatedAccounts { get; set; }
        public List<UserAccount> DeactivatedAccounts { get; set; }
        #endregion

        #region Products Tracker
        public List<Product> DeletedProducts { get; set; }
        public List<Product> UpdatedProducts { get; set; }
        public List<Product> CreatedProducts { get; set; }
        public List<Product> DeactivatedProducts { get; set; }
        #endregion

        #region Stores Tracker
        public List<Store> DeletedStores { get; set; }
        public List<Store> UpdatedStores { get; set; }
        public List<Store> CreatedStores { get; set; }
        public List<Store> DeactivatedStores { get; set; }
        #endregion

        #region Transactions Tracker
        public List<Transaction> DeletedTransactions { get; set; }
        public List<Transaction> UpdatedTransactions { get; set; }
        public List<Transaction> CreatedTransactions { get; set; }
        public List<Transaction> DeactivatedTransactions { get; set; }
        #endregion

        #region Product Transactions Tracker
        public List<ProductTransaction> DeletedProductTransactions { get; set; }
        public List<ProductTransaction> UpdatedProductTransactions { get; set; }
        public List<ProductTransaction> CreatedProductTransactions { get; set; }
        public List<ProductTransaction> DeactivatedProductTransactions { get; set; }
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
