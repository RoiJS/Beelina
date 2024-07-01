namespace Beelina.LIB.Models
{
    public class Supplier
        : Entity
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public List<Product> Products { get; set; } = [];

        public bool IsDeletable
    {
            get
            {
                return Products.Count == 0;
            }
        }
    }
}