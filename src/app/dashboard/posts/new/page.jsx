import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import ThanhDieuHuongDashboard from '../../../../components/ThanhDieuHuongDashboard'
import TrinhSoanThao from '../../../../components/TrinhSoanThao'

export default async function TrangVietBaiMoi() {
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
      <ThanhDieuHuongDashboard profile={profile} activePath="new-post" />
      <main className="dashboard-main">
        <TrinhSoanThao userId={user.id} />
      </main>
    </div>
  )
}
