namespace Beelina.LIB.Models
{
    public class ReportNotificationEmailAddress : Entity
    {
        public int UserAccountId { get; set; }
        public string EmailAddress { get; set; }
        public UserAccount UserAccount { get; set; }
    }
}