using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ProductMutation
    {
        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Product> UpdateProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
            [Service] IProductUnitRepository<ProductUnit> productUnitRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            ProductInput productInput)
        {
            var productFromRepo = await productRepository.GetEntity(productInput.Id).ToObjectAsync();
            var productStockPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(productInput.Id, currentUserService.CurrentUserId);
            var productUnitFromRepo = await productUnitRepository.GetProductUnitByName(productInput.ProductUnitInput.Name);

            productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (productFromRepo == null)
            {
                productFromRepo = mapper.Map<Product>(productInput);
            }
            else
            {
                mapper.Map(productInput, productFromRepo);
            }

            // Create new product unit if not exists.
            if (productUnitFromRepo == null)
            {
                productUnitFromRepo = new ProductUnit
                {
                    Name = productInput.ProductUnitInput.Name
                };

                await productUnitRepository.AddEntity(productUnitFromRepo);
            }

            productFromRepo.ProductUnitId = productUnitFromRepo.Id;

            await productRepository.UpdateProduct(productFromRepo);

            // Create new product stock per panel if not exists.
            if (productStockPerPanelFromRepo is null)
            {
                productStockPerPanelFromRepo = new ProductStockPerPanel
                {
                    ProductId = productFromRepo.Id,
                    UserAccountId = currentUserService.CurrentUserId,
                    StockQuantity = productInput.StockQuantity,
                    // PricePerUnit = productInput.PricePerUnit
                };
            }
            else
            {
                productStockPerPanelFromRepo.StockQuantity = productInput.StockQuantity;
                // productStockPerPanelFromRepo.PricePerUnit = productInput.PricePerUnit;
            }

            await productStockPerPanelRepository.UpdateProductStockPerPanel(productStockPerPanelFromRepo);

            return productFromRepo;
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Product> DeleteProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int productId)
        {
            var productFromRepo = await productRepository.GetEntity(productId).ToObjectAsync();

            productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (productFromRepo == null)
                throw new ProductNotExistsException(productId);

            productRepository.DeleteEntity(productFromRepo);
            await productRepository.SaveChanges();

            return productFromRepo;
        }

        public async Task<Product> AddDummyProducts(
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService)
        {
            await productRepository.AddEntity(new Product
            {
                Name = "(5) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1,
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(6) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(7) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(8) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(9) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(10) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(11) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(12) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(13) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(14) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(15) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(16) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(17) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(18) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(19) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(20) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(21) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(22) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(23) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(24) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(25) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(26) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(27) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(28) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(29) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(30) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(31) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(32) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(33) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(34) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(35) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(36) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(37) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(38) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(39) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(40) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(41) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(42) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(43) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(44) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            await productRepository.AddEntity(new Product
            {
                Name = "(45) Test product",
                Description = "Test description",
                StockQuantity = 15,
                PricePerUnit = 12.45f,
                ProductUnitId = 1
            });

            return new Product();
        }
    }
}
