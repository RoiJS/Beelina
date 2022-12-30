using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public abstract class Person : Entity
    {
        public string FirstName { get; set; } = String.Empty;
        public string MiddleName { get; set; } = String.Empty;
        public string LastName { get; set; } = String.Empty;
        public GenderEnum Gender { get; set; }
        public string PhotoUrl { get; set; } = String.Empty;
        public string PersonFullName
        {
            get
            {
                return String.Format("{0} {1}", FirstName, LastName);
            }
        }
    }
}
