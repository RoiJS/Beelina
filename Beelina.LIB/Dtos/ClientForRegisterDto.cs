using System.ComponentModel.DataAnnotations;

namespace Beelina.LIB.Dtos
{
    public class ClientForRegisterDto
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string MiddleName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [EmailAddress]
        public string EmailAddress { get; set; }
        public string ContactNumber { get; set; }
        public bool AutoSendEmail { get; set; } = false;
    }
}