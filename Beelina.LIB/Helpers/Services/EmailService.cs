using System.Net;
using System.Net.Mail;
using System.Net.Mime;

namespace Beelina.LIB.Helpers.Services
{
    public class EmailService
    {
        private readonly string _smtp;
        private readonly string _smtpServerPassword;
        private readonly string _smtpServerAddress;
        private readonly int _smtpPort;

        private byte[] _fileAttachmentStream { get; set; }
        private string _fileName { get; set; }

        public EmailService(string smtp, string smtpServerAddress, string smtpServerPassword, int smtpPort)
        {
            _smtpPort = smtpPort;
            _smtpServerAddress = smtpServerAddress;
            _smtpServerPassword = smtpServerPassword;
            _smtp = smtp;
        }

        public void SetFileAttachment(byte[] fileAttachment, string fileName)
        {
            _fileAttachmentStream = fileAttachment;
            _fileName = fileName;
        }

        public void Send(string senderEmail, string receiverEmail, string subject, string htmlBody, string cc = "", string bcc = "")
        {
            var fileattachmentStream = new MemoryStream();
            if (_fileAttachmentStream is not null && _fileAttachmentStream.Length > 0)
            {
                fileattachmentStream = new MemoryStream(_fileAttachmentStream);
            }

            var mail = new MailMessage()
            {
                IsBodyHtml = true
            };
            try
            {
                MailAddress fromAddress = new(senderEmail);
                mail.From = fromAddress;
                mail.Subject = subject;
                mail.Body = htmlBody;

                if (!String.IsNullOrEmpty(receiverEmail))
                {
                    foreach (var receiver in receiverEmail.Split(";"))
                    {
                        mail.To.Add(receiver);
                    }
                }

                if (!String.IsNullOrEmpty(bcc))
                {
                    foreach (var bccEmail in bcc.Split(";"))
                    {
                        mail.Bcc.Add(bccEmail);
                    }
                }

                if (!String.IsNullOrEmpty(cc) && receiverEmail != cc)
                {
                    mail.Bcc.Add(cc);
                }

                if (_fileAttachmentStream is not null)
                {
                    Attachment attachment = new(fileattachmentStream, new ContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    {
                        Name = _fileName
                    };
                    mail.Attachments.Add(attachment);
                }

                SmtpClient smtpClient = new(_smtp)
                {
                    Port = _smtpPort,
                    EnableSsl = true,
                    UseDefaultCredentials = false,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Credentials = new NetworkCredential(_smtpServerAddress, _smtpServerPassword)
                };

                smtpClient.Send(mail);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                mail.Dispose(); // Dispose of the email and attachment
                fileattachmentStream.Dispose(); // Dispose of the memory stream
            }
        }
    }
}