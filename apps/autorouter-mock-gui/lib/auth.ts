import { NextAuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, _req) {
        const adminUser : User = {
          id: "0",
          name: "Admin"
        }

        if (credentials?.username === "admin"
          && credentials?.password === process.env.ADMIN_PASSWORD) {
          return adminUser
        } else {
          return null
        }
      }
    })
  ]
}