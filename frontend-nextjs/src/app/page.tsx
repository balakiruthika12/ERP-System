import { redirect } from 'next/navigation';

/**
 * Root page: immediately redirect to the login screen.
 * Previously this was the default Next.js boilerplate page.
 */
export default function Home() {
  redirect('/login');
}
