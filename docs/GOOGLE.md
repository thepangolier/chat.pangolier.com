# Google SSO Setup

1. Go to [Google Console](https://console.cloud.google.com/)

2. Select or create a new project (top left beside logo)

3. Select OAuth Consent Screen (on left hand bar), or just [click here](https://console.cloud.google.com/auth/overview)

4. Fill in the form, make sure it's `External`

5. After filling the form, `Create OAuth Client`

6. Select Web Application

7. Make sure to add localhost:3000 (or others) ontop of your domain

8. Copy and paste the id created as your `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

*NOTE: You can always review and edit existing clients [here](https://console.cloud.google.com/auth/overview)*

*NOTE: You can add a brand, but, be mindful that Google will lock you out of your account. Better off just keeping it as is.*
