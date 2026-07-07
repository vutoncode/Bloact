import { redirect } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/server'
import ThanhDieuHuongDashboard from '../../../../../components/ThanhDieuHuongDashboard'
import TrinhSoanThao from '../../../../../components/TrinhSoanThao'

export default async function TrangSuaBaiViet({ params }) {
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
      <ThanhDieuHuongDashboard profile={profile} activePath="edit-post" />
      <main className="dashboard-main">
        <TrinhSoanThao post={post} userId={user.id} />
      </main>
    </div>
  )
}
