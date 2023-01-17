using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class BaseErrorFactory
        : IPayloadErrorFactory<BaseException, BaseError>
    {
        public BaseError CreateErrorFrom(BaseException ex)
        {
            return new BaseError(ex.ErrorMessage);
        }
    }
}
