using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ContactFormMutation
    {
        public async Task<ContactFormResult> SendContactForm(
            [Service] ILogger<ContactFormMutation> logger,
            [Service] IContactFormService contactFormService,
            ContactFormInput contactFormInput)
        {
            try
            {
                logger.LogInformation("Received contact form submission from {Email} - {Company}", 
                    contactFormInput.EmailAddress, contactFormInput.CompanyName);

                var result = await contactFormService.SendContactFormAsync(contactFormInput);

                if (result.IsSuccess)
                {
                    logger.LogInformation("Contact form processed successfully for {Email}", contactFormInput.EmailAddress);
                }
                else
                {
                    logger.LogWarning("Contact form processing failed for {Email}: {Error}", 
                        contactFormInput.EmailAddress, result.ErrorMessage);
                }

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error processing contact form for {Email}", contactFormInput.EmailAddress);
                return ContactFormResult.Error("An unexpected error occurred. Please try again later.");
            }
        }
    }
}
