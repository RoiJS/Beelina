using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Beelina.LIB.BusinessLogic
{
    public class ContactFormService : IContactFormService
    {
        private readonly ILogger<ContactFormService> _logger;
        private readonly EmailServerSettings _emailSettings;
        private readonly ContactFormSettings _contactFormSettings;

        public ContactFormService(
            ILogger<ContactFormService> logger,
            IOptions<EmailServerSettings> emailSettings,
            IOptions<ContactFormSettings> contactFormSettings)
        {
            _logger = logger;
            _emailSettings = emailSettings.Value;
            _contactFormSettings = contactFormSettings.Value;
        }

        public async Task<ContactFormResult> SendContactFormAsync(ContactFormInput contactForm)
        {
            try
            {
                _logger.LogInformation("Processing contact form submission from {Email}", contactForm.EmailAddress);

                // Validate input
                if (string.IsNullOrWhiteSpace(contactForm.FirstName) ||
                    string.IsNullOrWhiteSpace(contactForm.LastName) ||
                    string.IsNullOrWhiteSpace(contactForm.EmailAddress) ||
                    string.IsNullOrWhiteSpace(contactForm.CompanyName) ||
                    string.IsNullOrWhiteSpace(contactForm.Message))
                {
                    return ContactFormResult.Error("All required fields must be filled out.");
                }

                // Create email service
                var emailService = new EmailService(
                    _emailSettings.SmtpServer,
                    _emailSettings.SmtpAddress,
                    _emailSettings.SmtpPassword,
                    _emailSettings.SmtpPort);

                // Generate email content
                var emailContent = GenerateContactFormEmailContent(contactForm);
                var subject = $"New Contact Form Submission from {contactForm.CompanyName}";

                // Send email to company/admin
                var adminEmail = _contactFormSettings.AdminEmail;
                await Task.Run(() => emailService.Send(
                    contactForm.EmailAddress,
                    adminEmail,
                    subject,
                    emailContent));

                // Send confirmation email to customer
                var confirmationContent = GenerateConfirmationEmailContent(contactForm);
                var confirmationSubject = "Thank you for contacting Bizual";
                
                await Task.Run(() => emailService.Send(
                    adminEmail,
                    contactForm.EmailAddress,
                    confirmationSubject,
                    confirmationContent));

                _logger.LogInformation("Contact form email sent successfully for {Email}", contactForm.EmailAddress);
                return ContactFormResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending contact form email for {Email}", contactForm.EmailAddress);
                return ContactFormResult.Error("Failed to send contact form. Please try again later.");
            }
        }

        private string GenerateContactFormEmailContent(ContactFormInput contactForm)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>New Contact Form Submission</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #d89c2a 0%, #f4b942 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; }}
        .field {{ margin-bottom: 15px; }}
        .label {{ font-weight: bold; color: #555; }}
        .value {{ margin-top: 5px; padding: 10px; background: white; border-left: 4px solid #d89c2a; }}
        .footer {{ background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>New Contact Form Submission</h1>
            <p>Bizual Distribution Management</p>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Contact Person:</div>
                <div class='value'>{contactForm.FirstName} {contactForm.LastName}</div>
            </div>
            <div class='field'>
                <div class='label'>Company Name:</div>
                <div class='value'>{contactForm.CompanyName}</div>
            </div>
            <div class='field'>
                <div class='label'>Email Address:</div>
                <div class='value'>{contactForm.EmailAddress}</div>
            </div>
            <div class='field'>
                <div class='label'>Phone Number:</div>
                <div class='value'>{contactForm.PhoneNumber ?? "Not provided"}</div>
            </div>
            <div class='field'>
                <div class='label'>Business Type:</div>
                <div class='value'>{contactForm.BusinessType ?? "Not specified"}</div>
            </div>
            <div class='field'>
                <div class='label'>Message:</div>
                <div class='value'>{contactForm.Message}</div>
            </div>
        </div>
        <div class='footer'>
            <p>This email was sent from the Bizual contact form on {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateConfirmationEmailContent(ContactFormInput contactForm)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Thank you for contacting Bizual</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #d89c2a 0%, #f4b942 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 30px; }}
        .cta {{ background: #d89c2a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
        .footer {{ background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Thank You for Your Interest!</h1>
            <p>Bizual Distribution Management</p>
        </div>
        <div class='content'>
            <h2>Hello {contactForm.FirstName},</h2>
            <p>Thank you for reaching out to us through our contact form. We have received your inquiry about Bizual and our distribution management solutions.</p>
            
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Our team will review your inquiry within 24 hours</li>
                <li>A specialist will contact you to discuss your specific needs</li>
                <li>We'll schedule a personalized demo if you're interested</li>
            </ul>
            
            <p>In the meantime, feel free to explore our features and learn more about how Bizual can transform your distribution business.</p>
            
            <p>If you have any urgent questions, please don't hesitate to contact us directly at <strong>{_contactFormSettings.SupportEmail}</strong> or <strong>{_contactFormSettings.SupportPhone}</strong>.</p>
            
            <p>Best regards,<br>
            The {_contactFormSettings.CompanyName} Team</p>
        </div>
        <div class='footer'>
            <p>&copy; {DateTime.Now.Year} {_contactFormSettings.CompanyName}. All rights reserved.</p>
            <p>Transforming Distribution Excellence</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
