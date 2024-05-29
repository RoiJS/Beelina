using Beelina.LIB.Helpers.Services;

namespace Beelina.LIB.Interfaces
{
    public interface IExtractProductFileService
    {
        Task<ExtractProductResult> ReadFile(Stream fileStream);
    }
}
