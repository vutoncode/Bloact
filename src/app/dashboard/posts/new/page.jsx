import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import DashboardNav from '../../../../components/DashboardNav'
import Editor from '../../../../components/Editor'

export default async function NewPostPage() {
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

  if (!profile || !profile.username) {
    redirect('/onboarding')
  }

  return (
    <div className="dashboard-container">
      <DashboardNav profile={profile} activePath="new-post" />
      <main className="dashboard-main">
        <Editor userId={user.id} />
      </main>
    </div>
  )
}
