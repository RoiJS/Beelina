using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
     public class ControlValues : IControlValues
    {
        public int ControlId { get; set; }
        public string CurrentValue { get; set; }
    }
}