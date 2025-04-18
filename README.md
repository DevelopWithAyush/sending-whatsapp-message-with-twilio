# WhatsApp OTP Verification System

A Node.js backend that implements OTP verification via WhatsApp using Twilio's WhatsApp API. This system allows you to:

1. Send a 6-digit OTP to a user's WhatsApp number
2. Verify the OTP entered by the user

## 📚 Tech Stack

- **Node.js** with Express (ES Modules)
- **MongoDB** with Mongoose for data storage
- **Twilio** for WhatsApp messaging
- **Swagger** for API documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ installed
- MongoDB installed locally or a MongoDB Atlas account
- Twilio account with WhatsApp capability

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd whatsapp-otp-verification
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/whatsapp-otp
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   OTP_EXPIRY_MINUTES=5
   ```

4. Start the server

   ```
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

5. Access the API documentation at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## 🔧 API Endpoints

### Send OTP

```
POST /api/v1/auth/send-otp
```

**Request Body:**

```json
{
  "whatsapp": "+919876543210"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "OTP sent to WhatsApp"
}
```

### Verify OTP

```
POST /api/v1/auth/verify-otp
```

**Request Body:**

```json
{
  "whatsapp": "+919876543210",
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "status": "success",
  "message": "OTP verified successfully"
}
```

**Failure Response:**

```json
{
  "status": "error",
  "message": "Invalid or expired OTP"
}
```

## 📝 Notes

- This project uses ES Modules (import/export) instead of CommonJS (require/module.exports)
- OTPs expire after 5 minutes (configurable in .env)
- Only the latest non-expired OTP for a number can be used for verification
- The WhatsApp number must include the country code (e.g., +919876543210)

## 🔐 Setting Up Twilio WhatsApp

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Activate the WhatsApp Sandbox
3. Configure your WhatsApp number by sending a WhatsApp message to the Twilio number
4. Get your Account SID and Auth Token from the Twilio dashboard
5. Add these credentials to your .env file

## 📋 License

This project is licensed under the MIT License - see the LICENSE file for details.
