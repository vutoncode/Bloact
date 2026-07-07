import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import ThanhDieuHuongAdmin from '../../../components/ThanhDieuHuongAdmin'
import DanhSachBaiVietAdmin from '../../../components/DanhSachBaiVietAdmin'

export default async function TrangQuanLyBaiViet() {
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

  const { data: allPosts } = await supabase
    .from('posts')
    .select('*, author:profiles(display_name, username)')
    .order('created_at', { ascending: false })

  return (
    <div className="dashboard-container">
      <ThanhDieuHuongAdmin profile={profile} activePath="admin-posts" />
      
      <main className="dashboard-main">
        <DanhSachBaiVietAdmin initialPosts={allPosts} adminId={user.id} />
      </main>
    </div>
  )
}
