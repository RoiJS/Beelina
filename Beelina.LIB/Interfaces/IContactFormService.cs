using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.GraphQL.Results;

namespace Beelina.LIB.Interfaces
{
    public interface IContactFormService
    {
        Task<ContactFormResult> SendContactFormAsync(ContactFormInput contactForm);
    }
}
