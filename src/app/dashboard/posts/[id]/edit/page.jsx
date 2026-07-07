import { redirect } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/server'
import DashboardNav from '../../../../../components/DashboardNav'
import Editor from '../../../../../components/Editor'

export default async function EditPostPage({ params }) {
  const { id } = await params
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

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post || post.author_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="dashboard-container">
      <DashboardNav profile={profile} activePath="edit-post" />
      <main className="dashboard-main">
        <Editor post={post} userId={user.id} />
      </main>
    </div>
  )
}
