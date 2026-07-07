import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import ThanhDieuHuongAdmin from '../../../components/ThanhDieuHuongAdmin'
import DanhSachThanhVienAdmin from '../../../components/DanhSachThanhVienAdmin'

export default async function TrangQuanLyThanhVien() {
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
      <ThanhDieuHuongAdmin profile={profile} activePath="admin-users" />
      
      <main className="dashboard-main">
        <DanhSachThanhVienAdmin initialUsers={allUsers} adminId={user.id} />
      </main>
    </div>
  )
}
