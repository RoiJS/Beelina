using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class ProductErrorFactory
         : BaseErrorFactory
    {

        public ProductNotExistsError CreateErrorFrom(ProductNotExistsException ex)
        {
            return new ProductNotExistsError(ex.ProductId);
        }

        public ProductFailedRegisterError CreateErrorFrom(ProductFailedRegisterException ex)
        {
            return new ProductFailedRegisterError(ex.ProductName);
        }

        public ProductStockAuditNotExistsError CreateErrorFrom(ProductStockAuditNotExistsException ex)
        {
            return new ProductStockAuditNotExistsError(ex.Id);
        }
        
        public ExtractedProductsFileError CreateErrorFrom(ExtractProductFileException ex)
        {
            return new ExtractedProductsFileError(ex.Message);
        }
        
        public ExtractedProductsFileError CreateErrorFrom(ProductWithdrawalNotExistsException ex)
        {
            return new ExtractedProductsFileError(ex.Message);
        }
    }
}
