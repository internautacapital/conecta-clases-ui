import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'alumno' | 'profesor' | 'coordinador';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    email?: string | null;
    role?: 'alumno' | 'profesor' | 'coordinador';
  }
}
