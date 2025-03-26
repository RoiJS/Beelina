namespace Beelina.LIB.Dtos
{
    public class TextProductInventoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int AdditionalQuantity { get; set; }
        public double Price { get; set; }
        public bool IsTransferable { get; set; }
        public int NumberOfUnits { get; set; }
        public ProductUnitDto ProductUnit { get; set; }

        public TextProductInventoryDto()
        {
            ProductUnit = new ProductUnitDto();
        }
    }
}