namespace Beelina.LIB.Models
{
    public class DashboardModuleWidget
        : Entity
    {
        public int DashboardModuleId { get; set; }
        public string Name { get; set; }
        public DashboardModule DashboardModule { get; set; }
    }
}