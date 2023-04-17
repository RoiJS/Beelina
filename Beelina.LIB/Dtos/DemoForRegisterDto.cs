using System.ComponentModel.DataAnnotations;

namespace Beelina.LIB.Dtos
{
    public class DemoForRegisterDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string MiddleName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [EmailAddress]
        public string EmailAddress { get; set; }
        [Required]
        public string ContactNumber { get; set; }
        public bool AutoSendEmail { get; set; }
    }
}