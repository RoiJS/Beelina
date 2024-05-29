
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using OfficeOpenXml;

namespace Beelina.LIB.Helpers.Services
{
    public class ExtractProductFileService
        : IExtractProductFileService
    {
        private readonly ISupplierRepository<Supplier> _supplierRepository;
        private Stream _fileStream;

        public ExtractProductFileService(ISupplierRepository<Supplier> supplierRepository) => _supplierRepository = supplierRepository;

        public async Task<ExtractProductResult> ReadFile(Stream fileStream)
        {
            _fileStream = fileStream;
            var productExtractedResult = new ExtractProductResult();
            var successExtractedProducts = new List<SuccessExtractedProduct>();
            var failedExtractedProducts = new List<FailedExtractedProduct>();

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (ExcelPackage excelPackage = new ExcelPackage(_fileStream))
                {
                    ExcelWorksheet worksheet = excelPackage.Workbook.Worksheets[0]; // Assuming you're reading the first sheet

                    const int MAX_ROW_COUNT = 1000;
                    const int COLUMN_CODE_INDEX = 1;
                    const int COLUMN_NAME_INDEX = 2;
                    const int SUPPLIER_CODE_INDEX = 3;
                    const int COLUMN_QUANTITY_INDEX = 4;
                    const int COLUMN_PRICE_INDEX = 5;
                    const int COLUMN_UNIT_INDEX = 6;
                    const int COLUMN_NUMBER_OF_UNITS_INDEX = 7;
                    const int COLUMN_COUNT = 7;
                    const int ROW_DATA_START = 2;

                    int rowCount = worksheet.Dimension.Rows;
                    int columnCount = worksheet.Dimension.Columns;

                    if (columnCount != COLUMN_COUNT) throw new Exception($"The number of columns does not match the expected number of columns ({COLUMN_COUNT}). Please select a valid file and try again.");
                    if (rowCount > MAX_ROW_COUNT) throw new Exception($"The number of products exceeds the maximum limit (1000). The number of rows is {rowCount}. Please select a valid file and try again.");

                    for (int row = ROW_DATA_START; row <= rowCount; row++)
                    {
                        var successExtractedProduct = new SuccessExtractedProduct();
                        var supplierCodeValid = true;
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

                        if (!String.IsNullOrEmpty(worksheet.Cells[row, SUPPLIER_CODE_INDEX].Value?.ToString()))
                        {
                            // if (double.TryParse(worksheet.Cells[row, COLUMN_PRICE_INDEX].Value?.ToString(), out double price))
                            // {
                            //     successExtractedProduct.Price = (float)price;
                            // }
                            // else
                            // {
                            //     priceValid = false;
                            //     failedExtractedProducts.Add(new FailedExtractedProduct
                            //     {
                            //         RowNumber = row,
                            //         Message = "Invalid price value. Value must only be a numeric value."
                            //     });
                            // }

                            var supplierCode = worksheet.Cells[row, SUPPLIER_CODE_INDEX].Value?.ToString();
                            var supplierFromRepo = await _supplierRepository.GetSuppliers(supplierCode);
                            if (supplierFromRepo.Count > 0)
                            {
                                successExtractedProduct.SupplierCode = supplierCode;
                            }
                            else
                            {
                                supplierCodeValid = false;
                                failedExtractedProducts.Add(new FailedExtractedProduct
                                {
                                    RowNumber = row,
                                    Message = "Supplier Code does not exists. Please provide a valid supplier code."
                                });
                            }
                        }

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

                        if (supplierCodeValid && priceValid && quantityValid && numberOfUnitsValid)
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
        public string SupplierCode { get; set; }
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
        public int SupplierId { get; set; }
        public string SupplierCode { get; set; }
        public string Description { get; set; }
        public bool IsTransferable { get; set; }
        public float? Price { get; set; }
        public string Unit { get; set; }
        public int? NumberOfUnits { get; set; }
        public int Quantity { get; set; }
        public int OriginalNumberOfUnits { get; set; }
        public int OriginalSupplierId { get; set; }
        public string OriginalSupplierCode { get; set; }
        public string OriginalName { get; set; }
        public float OriginalPrice { get; set; }
        public string OriginalUnit { get; set; }

        public MapExtractedProduct()
        {

        }
    }
}