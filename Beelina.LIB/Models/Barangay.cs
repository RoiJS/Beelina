namespace Beelina.LIB.Models
{
    public class Barangay
        : Entity
    {
        public string Code { get; set; }
        public string Name { get; set; }

        public List<Store> Stores { get; set; }

        public bool IsDeletable
        {
            get
            {
                return Stores.Count == 0;
            }
        }
    }
}