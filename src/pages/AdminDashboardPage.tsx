import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';
import { Campaign, Profile, ReportedItem, Review } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reports, setReports] = useState<ReportedItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        users: Profile[];
        campaigns: Campaign[];
        reports: ReportedItem[];
        reviews: Review[];
        stats: any;
      }>('/api/admin/overview');
      setUsers(res.users || []);
      setCampaigns(res.campaigns || []);
      setReports(res.reports || []);
      setReviews(res.reviews || []);
      setStats(res.stats || {});
    } catch (err: any) {
      showToast(err.message || 'Admin access required.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const toggleVerifyUser = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/verify`, { method: 'PATCH' });
      showToast('User verification status updated.', 'success');
      loadAdmin();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user.', 'error');
    }
  };

  const handleReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await apiRequest(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Report marked as ${status}.`, 'success');
      loadAdmin();
    } catch (err: any) {
      showToast(err.message || 'Failed to update report.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="glass-card rounded-3xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#FF7A1A]/40">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A1A] mb-1">
          <ShieldCheck className="w-4 h-4" /> Trust, Safety & Marketplace Moderation
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">
          Platform Admin & Moderation Hub
        </h1>
        <p className="text-sm text-[#B9B3D0] mt-1">
          Verify AI creators, moderate reported portfolio content, and oversee platform activity.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10">
            <span className="text-xs text-[#B9B3D0] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#9D7BFF]" /> Total Accounts
            </span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">
              {stats.totalUsers || users.length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10">
            <span className="text-xs text-[#B9B3D0] flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Total Campaigns
            </span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">
              {stats.totalCampaigns || campaigns.length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10">
            <span className="text-xs text-[#B9B3D0] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF7A1A]" /> Pending Reports
            </span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">
              {stats.pendingReports || 0}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10">
            <span className="text-xs text-[#B9B3D0] flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Published Reviews
            </span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">
              {reviews.length}
            </span>
          </div>
        </div>
      </div>

      {/* Reported Content Queue */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h2 className="font-display font-bold text-xl text-white">
          Reported Content Moderation Queue ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="text-xs text-[#B9B3D0]">No reported content items.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-[#0B081D]/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300">
                      {rep.item_type}
                    </span>
                    <span className="font-bold text-sm text-white">{rep.item_title}</span>
                  </div>
                  <p className="text-xs text-[#B9B3D0] mt-1">
                    Reason: “{rep.reason}” — Reported by {rep.reporter_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs uppercase font-bold text-[#9D7BFF] mr-2">
                    {rep.status}
                  </span>
                  {rep.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReportStatus(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl text-xs bg-white/10 text-[#B9B3D0] hover:text-white flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Dismiss
                      </button>
                      <button
                        onClick={() => handleReportStatus(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl text-xs bg-emerald-500 text-white font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User & Creator Verification Management */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h2 className="font-display font-bold text-xl text-white">
          User & Creator Verification Directory
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#B9B3D0]">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Verified Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <img src={u.avatar_url} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    {u.name}
                  </td>
                  <td className="py-3 px-3 text-[#B9B3D0]">{u.email}</td>
                  <td className="py-3 px-3 capitalize text-[#9D7BFF] font-medium">{u.role}</td>
                  <td className="py-3 px-3">
                    {u.verified ? (
                      <span className="text-emerald-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-amber-300">Unverified</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleVerifyUser(u.id)}
                      className="px-3 py-1 rounded-lg bg-[#7C4DFF]/20 hover:bg-[#7C4DFF] text-white border border-[#7C4DFF]/40 transition"
                    >
                      {u.verified ? 'Revoke Badge' : 'Verify User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
