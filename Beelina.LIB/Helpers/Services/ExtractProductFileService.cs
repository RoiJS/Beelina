
using OfficeOpenXml;

namespace Beelina.LIB.Helpers.Services
{
    public class ExtractProductFileService
    {
        private readonly Stream _fileStream;

        public ExtractProductFileService(Stream fileStream)
        {
            _fileStream = fileStream;
        }

        public ExtractProductResult ReadFile()
        {
            var productExtractedResult = new ExtractProductResult();
            var successExtractedProducts = new List<SuccessExtractedProduct>();
            var failedExtractedProducts = new List<FailedExtractedProduct>();

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (ExcelPackage excelPackage = new ExcelPackage(_fileStream))
                {
                    ExcelWorksheet worksheet = excelPackage.Workbook.Worksheets[0]; // Assuming you're reading the first sheet

                    const int COLUMN_CODE_INDEX = 1;
                    const int COLUMN_NAME_INDEX = 2;
                    const int COLUMN_QUANTITY_INDEX = 3;
                    const int COLUMN_PRICE_INDEX = 4;
                    const int COLUMN_UNIT_INDEX = 5;
                    const int COLUMN_NUMBER_OF_UNITS_INDEX = 6;
                    const int COLUMN_COUNT = 6;
                    const int ROW_DATA_START = 2;

                    int rowCount = worksheet.Dimension.Rows;
                    int columnCount = worksheet.Dimension.Columns;

                    if (columnCount != COLUMN_COUNT) throw new Exception("The number of columns does not match the expected number of columns (6). Please select a valid file and try again.");

                    for (int row = ROW_DATA_START; row <= rowCount; row++)
                    {
                        var successExtractedProduct = new SuccessExtractedProduct();
                        var priceValid = true;
                        var quantityValid = true;
                        var numberOfUnitsValid = true;

                        successExtractedProduct.Code = worksheet.Cells[row, COLUMN_CODE_INDEX].Value?.ToString();

                        if (String.IsNullOrEmpty(successExtractedProduct.Code))
                        {
                            failedExtractedProducts.Add(new FailedExtractedProduct
                            {
                                RowNumber = row,
                                Message = "Empty product code. Please provide a valid product code."
                            });
                            continue;
                        }

                        successExtractedProduct.Name = worksheet.Cells[row, COLUMN_NAME_INDEX].Value?.ToString();
                        successExtractedProduct.Unit = worksheet.Cells[row, COLUMN_UNIT_INDEX].Value?.ToString();

                        if (!String.IsNullOrEmpty(worksheet.Cells[row, COLUMN_PRICE_INDEX].Value?.ToString()))
                        {
                            if (double.TryParse(worksheet.Cells[row, COLUMN_PRICE_INDEX].Value?.ToString(), out double price))
                            {
                                successExtractedProduct.Price = (float)price;
                            }
                            else
                            {
                                priceValid = false;
                                failedExtractedProducts.Add(new FailedExtractedProduct
                                {
                                    RowNumber = row,
                                    Message = "Invalid price value. Value must only be a numeric value."
                                });
                            }
                        }

                        if (!String.IsNullOrEmpty(worksheet.Cells[row, COLUMN_QUANTITY_INDEX].Value?.ToString()))
                        {
                            if (int.TryParse(worksheet.Cells[row, COLUMN_QUANTITY_INDEX].Value?.ToString(), out int quantity))
                            {
                                successExtractedProduct.Quantity = quantity;
                            }
                            else
                            {
                                quantityValid = false;
                                failedExtractedProducts.Add(new FailedExtractedProduct
                                {
                                    RowNumber = row,
                                    Message = "Invalid quantity value. Value must only be a numeric value."
                                });
                            }
                        }

                        if (!String.IsNullOrEmpty(worksheet.Cells[row, COLUMN_NUMBER_OF_UNITS_INDEX].Value?.ToString()))
                        {
                            if (int.TryParse(worksheet.Cells[row, COLUMN_NUMBER_OF_UNITS_INDEX].Value?.ToString(), out int numberOfUnits))
                            {
                                successExtractedProduct.NumberOfUnits = numberOfUnits;
                            }
                            else
                            {
                                numberOfUnitsValid = false;
                                failedExtractedProducts.Add(new FailedExtractedProduct
                                {
                                    RowNumber = row,
                                    Message = "Invalid number of units value. Value must only be a numeric value."
                                });
                            }
                        }

                        if (priceValid && quantityValid && numberOfUnitsValid)
                        {
                            successExtractedProducts.Add(successExtractedProduct);
                        }
                    }
                }
            }
            catch
            {
                throw;
            }

            productExtractedResult.SuccessExtractedProducts = successExtractedProducts;
            productExtractedResult.FailedExtractedProducts = failedExtractedProducts;

            return productExtractedResult;
        }
    }

    public class ExtractProductResult
    {
        public List<SuccessExtractedProduct> SuccessExtractedProducts { get; set; }
        public List<FailedExtractedProduct> FailedExtractedProducts { get; set; }

        public ExtractProductResult()
        {
            SuccessExtractedProducts = new List<SuccessExtractedProduct>();
            FailedExtractedProducts = new List<FailedExtractedProduct>();
        }
    }

    public class MapExtractedProductResult
    {
        public List<MapExtractedProduct> SuccessExtractedProducts { get; set; }
        public List<FailedExtractedProduct> FailedExtractedProducts { get; set; }

        public MapExtractedProductResult()
        {
            SuccessExtractedProducts = new List<MapExtractedProduct>();
            FailedExtractedProducts = new List<FailedExtractedProduct>();
        }
    }

    public class SuccessExtractedProduct
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public float? Price { get; set; } = null;
        public string Unit { get; set; }
        public int Quantity { get; set; }
        public int? NumberOfUnits { get; set; } = null;

        public SuccessExtractedProduct()
        {

        }
    }

    public class FailedExtractedProduct
    {
        public int RowNumber { get; set; }
        public string Message { get; set; }

        public FailedExtractedProduct()
        {

        }
    }

    public class MapExtractedProduct
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsTransferable { get; set; }
        public float? Price { get; set; }
        public string Unit { get; set; }
        public int? NumberOfUnits { get; set; }
        public int Quantity { get; set; }
        public int OriginalNumberOfUnits { get; set; }
        public string OriginalName { get; set; }
        public float OriginalPrice { get; set; }
        public string OriginalUnit { get; set; }

        public MapExtractedProduct()
        {

        }
    }
}