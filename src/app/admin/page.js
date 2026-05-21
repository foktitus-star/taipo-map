import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Server-side redirect to the actual admin editor page
  redirect('/admin/route-editor');
  return null;
}
