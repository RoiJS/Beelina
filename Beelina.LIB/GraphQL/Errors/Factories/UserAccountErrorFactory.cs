using Beelina.LIB.GraphQL.Exceptions;

namespace Beelina.LIB.GraphQL.Errors.Factories
{
    public class UserAccountErrorFactory
         : BaseErrorFactory,
            IPayloadErrorFactory<UsernameAlreadyExistsException, UsernameAlreadyExistsError>,
            IPayloadErrorFactory<InvalidCredentialsException, InvalidCredentialsError>,
            IPayloadErrorFactory<UserAccountNotExistsException, UserAccountNotExistsError>
    {
        public UsernameAlreadyExistsError CreateErrorFrom(UsernameAlreadyExistsException ex)
        {
            return new UsernameAlreadyExistsError(ex.Username);
        }

        public InvalidCredentialsError CreateErrorFrom(InvalidCredentialsException ex)
        {
            return new InvalidCredentialsError();
        }

        public UserAccountNotExistsError CreateErrorFrom(UserAccountNotExistsException ex)
        {
            return new UserAccountNotExistsError();
        }

        public InvalidRefreshTokenError CreateErrorFrom(InvalidRefreshTokenException ex)
        {
            return new InvalidRefreshTokenError();
        }

        public SystemUpdateActiveError CreateErrorFrom(SystemUpdateActiveException ex)
        {
            return new SystemUpdateActiveError();
        }
    }
}
