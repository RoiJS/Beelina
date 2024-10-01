using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public abstract class Entity : IEntity
    {
        public int Id { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsDelete { get; set; } = false;
        public DateTime DateCreated { get; set; }
        public DateTime DateUpdated { get; set; }
        public DateTime DateDeleted { get; set; }
        public DateTime DateDeactivated { get; set; }
    }
}
