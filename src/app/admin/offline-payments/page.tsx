'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { 
  Search, ClipboardList, AlertCircle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function OfflinePaymentsPage() {
  const [loading, setLoading] = useState(false);
  
  // Override state
  const [searchPhone, setSearchPhone] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Manual payment requests state
  const [manualRequests, setManualRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [activeRequestsTab, setActiveRequestsTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchManualRequests('pending');
  }, []);

  const fetchManualRequests = async (statusFilter: 'pending' | 'approved' | 'rejected') => {
    setRequestsLoading(true);
    try {
      const res = await axios.get(`/api/admin/manual-payment-requests?status=${statusFilter}`);
      if (res.data.success) setManualRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestsTabChange = (tab: 'pending' | 'approved' | 'rejected') => {
    setActiveRequestsTab(tab);
    fetchManualRequests(tab);
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;
    setSearchLoading(true);
    setFoundUser(null);
    try {
      const res = await axios.get(`/api/admin/users?search=${searchPhone}`);
      if (res.data.success && res.data.data.length > 0) {
        setFoundUser(res.data.data[0]);
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOverride = async (type: string) => {
    if (!foundUser || !confirm(`Are you sure you want to mark ${type} as paid?`)) return;
    setOverrideLoading(true);
    try {
      const res = await axios.post('/api/admin/payment-override', {
        userId: foundUser._id,
        type: type !== 'all' ? type : undefined,
        action: type === 'all' ? 'complete_all' : undefined
      });
      if (res.data.success) {
        toast.success('Payment override successful');
        setFoundUser(null);
        setSearchPhone('');
      }
    } catch (error: any) {
      toast.error('Override failed');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this payment request?`)) return;
    setReviewLoading(requestId);
    try {
      const res = await axios.patch('/api/admin/manual-payment-requests', { requestId, action });
      if (res.data.success) {
        toast.success(action === 'approve' ? 'Payment approved!' : 'Request rejected.');
        fetchManualRequests(activeRequestsTab);
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setReviewLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ClipboardList className="text-primary" />
          Offline Payments & Approvals
        </h2>
        <p className="text-gray-500 mt-2 font-medium">Bypass gateways, mark offline payments, and review verification requests.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Manual Admin Override */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-black text-secondary mb-2">Manual Approval Search</h3>
          <p className="text-sm text-gray-500 mb-6 font-medium">Search user by mobile number to bypass gateway.</p>

          <form onSubmit={handleSearchUser} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Search by Mobile..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit" disabled={searchLoading} className="px-6 py-3 bg-secondary text-white rounded-xl flex items-center gap-2 hover:bg-secondary/90 transition-all font-bold">
              <Search size={18} /> {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {foundUser && (
            <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-4">
              <p className="font-bold text-lg text-secondary">{foundUser.fullName} <span className="text-sm font-normal text-gray-500">({foundUser.role})</span></p>
              <div className="pt-4 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {!foundUser.subscriptionPaid && (
                  <button onClick={() => handleOverride('subscription')} disabled={overrideLoading} className="w-full py-3 bg-white border text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all">
                    Mark Sub Paid
                  </button>
                )}
                {!foundUser.depositPaid && (
                  <button onClick={() => handleOverride('deposit')} disabled={overrideLoading} className="w-full py-3 bg-white border text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all">
                    Mark Deposit Paid
                  </button>
                )}
                {(!foundUser.subscriptionPaid || !foundUser.depositPaid) && (
                  <button onClick={() => handleOverride('all')} disabled={overrideLoading} className="w-full md:col-span-2 py-4 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all">
                    Confirm Full Payment
                  </button>
                )}
                {(foundUser.subscriptionPaid && foundUser.depositPaid) && (
                  <div className="md:col-span-2 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 size={20} /> All Payments Complete
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Verification Requests */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
            <ClipboardList size={24} className="text-primary"/> Verification Requests
          </h3>
          
          <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl mb-6">
            {(['pending', 'approved', 'rejected'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => handleRequestsTabChange(tab)} 
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeRequestsTab === tab ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {requestsLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : manualRequests.map(req => (
              <div key={req._id} className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-base text-secondary">{req.userId?.fullName || req.name}</p>
                  <span className="text-xs font-black px-3 py-1 bg-white border rounded-full text-primary">₹{req.amount}</span>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{req.type}</p>
                <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Transaction / UTR ID</span>
                  <span className="text-sm font-mono font-bold break-all">{req.transactionId}</span>
                </div>
                
                {req.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => handleReviewRequest(req._id, 'approve')} 
                      disabled={reviewLoading === req._id}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs uppercase font-black hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                      {reviewLoading === req._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleReviewRequest(req._id, 'reject')} 
                      disabled={reviewLoading === req._id}
                      className="flex-1 py-3 bg-white border border-red-200 text-red-500 rounded-xl text-xs uppercase font-black hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!requestsLoading && manualRequests.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CheckCircle2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No {activeRequestsTab} requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
