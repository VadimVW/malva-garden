export type CustomerJwtPayload = {
  sub: string;
  email: string;
  role: "customer";
};

export type CurrentCustomer = {
  id: string;
  email: string;
};
