import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to root where the dashboard already exists
  redirect('/')
}
