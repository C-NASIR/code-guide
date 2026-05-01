export class AuthService {
  static async login(username: string) {
    return {
      username,
      token: `token-${username}`
    };
  }
}
