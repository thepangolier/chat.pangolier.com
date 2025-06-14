# Github SSO Setup

- Go to [Developer Settings](https://github.com/settings/apps)

- Set the callback urls:

```bash
http://localhost:3000/api/sso/github
https://chat.pangolier.com/api/sso/github
```

- Create a new client secret

- Copy and paste the `.env` values:

```env
GITHUB_SECRET="..."
NEXT_PUBLIC_GITHUB_CLIENT_ID="..."
```

- *Optional* add a nice photo and/or description
