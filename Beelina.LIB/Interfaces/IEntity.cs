using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Beelina.LIB.Interfaces
{
    public interface IEntity
    {
        int Id { get; set; }
        bool IsActive { get; set; }
        bool IsDelete { get; set; }
        DateTime DateDeleted { get; set; }
        DateTime DateDeactivated { get; set; }
        DateTime DateCreated { get; set; }
        DateTime DateUpdated { get; set; }
    }
}
