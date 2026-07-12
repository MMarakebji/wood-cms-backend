export type JwtPayload = {
  sub: string;
  email: string;
  type: 'access';
};

export type RefreshJwtPayload = {
  sub: string;
  email: string;
  sid: string;
  type: 'refresh';
};
