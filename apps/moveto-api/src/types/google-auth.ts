export interface GoogleToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  picture: string;
}
