export {}

declare global {
  namespace Express {
    interface Request {
      auth: OAuth2.Token
      user: number
    }
  }
}
