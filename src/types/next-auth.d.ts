import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
  }
}
