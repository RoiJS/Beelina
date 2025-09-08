namespace Beelina.LIB.GraphQL.Results
{
    public class ContactFormResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string ErrorMessage { get; set; }

        public static ContactFormResult Success(string message = "Contact form submitted successfully!")
        {
            return new ContactFormResult
            {
                IsSuccess = true,
                Message = message,
                ErrorMessage = null
            };
        }

        public static ContactFormResult Error(string errorMessage)
        {
            return new ContactFormResult
            {
                IsSuccess = false,
                Message = null,
                ErrorMessage = errorMessage
            };
        }
    }
}
