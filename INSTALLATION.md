# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/web3connections

# Cosmos Blockchain
COSMOS_RPC_URL=https://rpc.cosmos.network:443
COSMOS_REST_URL=https://rest.cosmos.network
CHAIN_ID=cosmoshub-4

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d

# Optional settings (if implementing these features)
# Notifications
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN