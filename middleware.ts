import { withAuth } from 'next-auth/middleware';

export default withAuth(function middleware() {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith('/dashboard')) {
        return !!token;
      }
      if (pathname.startsWith('/api')) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
