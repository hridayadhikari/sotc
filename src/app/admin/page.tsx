import { getAdminDashboardData } from '@/actions/certificates';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Streets of Tripura Certificate System',
};

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <AdminDashboardClient
        initialCertificates={data.certificates}
        initialStats={data.stats}
        initialAuditLogs={data.auditLogs}
        adminUser={data.user}
      />
    </div>
  );
}
