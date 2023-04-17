
using Beelina.LIB.Enums;

namespace Beelina.LIB.Dtos
{
    public class ClientDto
    {
        public string Name { get; set; }
        public string DBName { get; set; }
        public string DBHashName { get; set; }
        public string Description { get; set; }
        public string ContactNumber { get; set; }
        public ClientTypeEnum Type { get; set; } = ClientTypeEnum.Regular;
    }
}