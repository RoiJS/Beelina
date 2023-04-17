using System.Net;
using System.Net.Mail;

namespace ReserbizAPP.LIB.Helpers.Services {
    public class EmailService {
        private readonly string _smtp;
        private readonly string _smtpServerPassword;
        private readonly string _smtpServerAddress;
        private readonly int _smtpPort;

        public EmailService (string smtp, string smtpServerAddress, string smtpServerPassword, int smtpPort) {
            _smtpPort = smtpPort;
            _smtpServerAddress = smtpServerAddress;
            _smtpServerPassword = smtpServerPassword;
            _smtp = smtp;
        }

        public void Send (string senderEmail, string receiverEmail, string subject, string htmlBody, string bcc = "") {
            try {
                MailMessage mail = new MailMessage ();
                mail.IsBodyHtml = true;
                MailAddress fromAddress = new MailAddress (senderEmail);
                mail.From = fromAddress;
                mail.To.Add (receiverEmail);
                mail.Subject = subject;
                mail.Body = htmlBody;

                if (!String.IsNullOrEmpty (bcc)) {
                    mail.Bcc.Add (bcc);
                }

                SmtpClient smtpClient = new SmtpClient (_smtp);
                smtpClient.Port = _smtpPort;
                smtpClient.EnableSsl = false;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtpClient.Credentials = new NetworkCredential (_smtpServerAddress, _smtpServerPassword);

                smtpClient.Send (mail);
                mail.Dispose ();
            } catch (Exception ex) {
                throw ex;
            }
        }
    }
}