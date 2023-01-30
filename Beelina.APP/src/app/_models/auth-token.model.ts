export class AuthToken {
  private _currentDate: Date = new Date();

  constructor(
    private _accessToken: string,
    private _refreshToken: string,
    private _refreshTokenExpirationDate: Date
  ) {}

  /**
   * This is to set the current date.
   * Purely used for unit testing.
   * @param currentDate Current date argument
   */
  setCurrentDate(currentDate: Date) {
    this._currentDate = currentDate;
  }

  get isAuth(): boolean {
    return this._refreshTokenExpirationDate > this._currentDate;
  }

  get token(): string | null {
    if (!this._accessToken) {
      return null;
    }

    return this._accessToken;
  }

  get refreshToken(): string {
    if (!this._refreshToken) {
      return null;
    }

    return this._refreshToken;
  }

  get timeToExpiry(): number {
    return (
      this._refreshTokenExpirationDate.getTime() - this._currentDate.getTime()
    );
  }
}
