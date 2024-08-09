namespace Beelina.LIB.Models
{
    public class UserSetting
        : Entity
    {
        public int UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }
        public bool AllowOrderPayments { get; set; } = true;
        public bool AllowOrderConfirmation { get; set; } = true;
    }
}