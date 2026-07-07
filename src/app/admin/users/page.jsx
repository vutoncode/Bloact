import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import AdminNav from '../../../components/AdminNav'
import AdminUsersList from '../../../components/AdminUsersList'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="dashboard-container">
      <AdminNav profile={profile} activePath="admin-users" />
      
      <main className="dashboard-main">
        <AdminUsersList initialUsers={allUsers} adminId={user.id} />
      </main>
    </div>
  )
}
