# Health_Clinic_Management_Version2
 designed to optimize clinic operations. It provides role-specific access for admins, doctors, nurses, and patients to efficiently manage appointments, medical records, and billing. Key functionalities include user registration, appointment scheduling, prescription management, online payments and comprehensive reporting with visual charts.

# Table Of Content

[database](#database)

[setup](#how-to-setup)

[docs](#docs)

## Database
![database](/images/db.png)
## How To Setup
### Requirements

1. [Visual Studio Code](https://code.visualstudio.com/)

2. [Mongodb](https://www.mongodb.com/)

3. [Mongo Compass](https://www.mongodb.com/products/tools/compass)

4. [NodeJS](https://nodejs.org/en)

````bash
# Clone the project
git clone https://github.com/HieuPBT/Health_Clinic_Management_Version2.git
````

### Config
1. Create backend .env
````bash
cd Health_Clinic_Management_Version2

cd server

# Fill your .env
MONGO_URI=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
SESSION_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_USER=
EMAIL_PASS=

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8888"
PORT="8888"

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=

```` 

2. create frontend .env

````bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

````
3. Run
````bash
# run backend
cd Health_Clinic_Management_Version2

cd server

# install package.json
npm install

# run
npm start

# run frontend
cd ..

cd client

# install package.json
npm install

# run
npm run dev
````

Now you can access `localhost:3000` for frontend and `localhost:8888` for backend

## Docs
🔗 [NextJS](https://nextjs.org/)

🔗 [NodeJS](https://nodejs.org/en)

🔗 [Shadcn-ui](https://ui.shadcn.com/)

🔗 [Mongodb](https://www.mongodb.com/)
