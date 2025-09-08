# Contact Form GraphQL Mutation

## Endpoint
`POST /graphql`

## Mutation Query
```graphql
mutation SendContactForm($contactForm: ContactFormInput!) {
  sendContactForm(contactForm: $contactForm) {
    isSuccess
    message
    errorMessage
  }
}
```

## Variables
```json
{
  "contactForm": {
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "john.doe@example.com",
    "companyName": "ABC Distribution Company",
    "phoneNumber": "+63 917 123 4567",
    "businessType": "wholesaler",
    "message": "I'm interested in learning more about Bizual's distribution management solutions for our wholesale business. We currently manage 50+ retail clients and are looking to streamline our operations."
  }
}
```

## Expected Response - Success
```json
{
  "data": {
    "sendContactForm": {
      "isSuccess": true,
      "message": "Contact form submitted successfully!",
      "errorMessage": null
    }
  }
}
```

## Expected Response - Error
```json
{
  "data": {
    "sendContactForm": {
      "isSuccess": false,
      "message": null,
      "errorMessage": "All required fields must be filled out."
    }
  }
}
```

## Email Flow
1. **Admin Notification Email**: Sent to `admin@beelina.com` with all contact form details
2. **Customer Confirmation Email**: Sent to the customer's email address with a thank you message and next steps

## Configuration
- Email settings are configured in `appsettings.json` under `EmailServerSettings`
- Contact form settings (admin email, company info) are in `ContactFormSettings`
- All email templates are embedded in the service with professional HTML styling

## Business Type Options
- `wholesaler` - Wholesale Distribution
- `retailer` - Retail Distribution  
- `manufacturer` - Manufacturing
- `pharmacy` - Pharmacy/Medical
- `food` - Food & Beverage
- `other` - Other

## Required Fields
- firstName
- lastName
- emailAddress
- companyName
- message

## Optional Fields
- phoneNumber
- businessType
