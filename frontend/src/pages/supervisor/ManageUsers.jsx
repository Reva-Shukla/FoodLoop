import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CAMPUS_USERS, MOCK_REGISTRATION_REQUESTS } from '../../data/mockUsers';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Building2,
  HeartHandshake,
  UserX,
  Info
} from 'lucide-react';

export default function ManageUsers() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' | 'APPROVALS'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'MESS' | 'NGO' | 'ADMIN'
  const [search, setSearch] = useState('');

  // Modular Registration Requests Demo State
  const [requests, setRequests] = useState(MOCK_REGISTRATION_REQUESTS);
  const [actionFeedback, setActionFeedback] = useState('');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return MOCK_CAMPUS_USERS.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = u.name.toLowerCase().includes(q);
        const mEmail = u.email.toLowerCase().includes(q);
        const mMess = (u.assignedMessName || '').toLowerCase().includes(q);
        const mOrg = (u.organization || '').toLowerCase().includes(q);
        if (!mName && !mEmail && !mMess && !mOrg) return false;
      }
      return true;
    });
  }, [roleFilter, search]);

  const handleApprove = (reqId, name) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'APPROVED' } : r))
    );
    setActionFeedback(`Request for ${name} marked as Approved (Frontend Demo Preview).`);
  };

  const handleReject = (reqId, name) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'REJECTED' } : r))
    );
    setActionFeedback(`Request for ${name} marked as Rejected.`);
  };

  const getRoleBadge = (role) => {
    if (role === 'MESS') {
      return { label: 'Mess Manager', bg: 'var(--color-saffron-light)', color: 'var(--color-saffron-dark)' };
    }
    if (role === 'NGO') {
      return { label: 'NGO Partner', bg: 'var(--color-terracotta-light)', color: 'var(--color-terracotta-dark)' };
    }
    return { label: 'Campus Supervisor', bg: 'rgba(24, 60, 50, 0.08)', color: 'var(--color-forest)' };
  };

  return (
    <DashboardLayout title="Manage Users">
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 6 }}>
              <span>Administrative Directory</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Campus User Directory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Authorized accounts across Chitkara University residential dining halls and redistribution partners.
            </p>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {actionFeedback && (
          <div
            style={{
              backgroundColor: 'var(--color-sage-subtle)',
              border: '1.5px solid var(--color-sage)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              fontSize: '0.86rem',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-forest)' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab & Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Main Tab Switcher */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                border: activeTab === 'USERS' ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                backgroundColor: activeTab === 'USERS' ? 'var(--color-forest)' : 'var(--color-cream-light)',
                color: activeTab === 'USERS' ? '#FFFFFF' : 'var(--color-forest-dark)',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'USERS' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              Active Users ({MOCK_CAMPUS_USERS.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPROVALS')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                border: activeTab === 'APPROVALS' ? '1.5px solid var(--color-forest)' : '1px solid var(--color-cream-border)',
                backgroundColor: activeTab === 'APPROVALS' ? 'var(--color-forest)' : 'var(--color-cream-light)',
                color: activeTab === 'APPROVALS' ? '#FFFFFF' : 'var(--color-forest-dark)',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'APPROVALS' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Registration Requests</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: 8,
                  backgroundColor: activeTab === 'APPROVALS' ? 'rgba(255,255,255,0.25)' : 'var(--color-terracotta-light)',
                  color: activeTab === 'APPROVALS' ? '#FFFFFF' : 'var(--color-terracotta-dark)',
                  fontWeight: 700,
                }}
              >
                {requests.filter((r) => r.status === 'PENDING').length}
              </span>
            </button>
          </div>

          {activeTab === 'USERS' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Role Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-cream-border)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="MESS">Mess Manager</option>
                  <option value="NGO">NGO Partner</option>
                  <option value="ADMIN">Campus Supervisor</option>
                </select>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: 200 }}>
                <Search
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-cream-border)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content View */}
        {activeTab === 'USERS' ? (
          /* Active Users Table */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-cream-border)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>User Name / Organisation</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Email Address</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Role</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Assigned Context</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const badge = getRoleBadge(u.role);
                    return (
                      <tr
                        key={u.id}
                        style={{ borderBottom: '1px solid var(--color-cream-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-cream-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: 'var(--color-forest-dark)' }}>{u.name}</strong>
                          {u.organization && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.organization}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-forest-dark)' }}>
                          {u.assignedMessName || u.department || 'Campus Wide'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, backgroundColor: 'var(--color-sage-subtle)', color: 'var(--color-forest)' }}>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {u.lastActive}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Registration Requests Approval Preview */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Disclaimer notice */}
            <div
              style={{
                backgroundColor: 'rgba(230, 162, 60, 0.1)',
                border: '1px solid rgba(230, 162, 60, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: 'var(--color-saffron-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Frontend Demonstration Preview:</strong> This account approval interface is a prototype module for Phase 5. Backend MySQL user verification and auth persistence will be integrated during Phase 7.
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-cream-border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Applicant Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Email Address</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Requested Role</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Proposed Affiliation</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Request Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--color-cream-border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                          {req.name}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {req.email}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: req.requestedRole === 'MESS' ? 'var(--color-saffron-light)' : 'var(--color-terracotta-light)', color: req.requestedRole === 'MESS' ? 'var(--color-saffron-dark)' : 'var(--color-terracotta-dark)' }}>
                            {req.requestedRoleTitle}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-forest-dark)' }}>
                          {req.proposedMess || req.organization}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {req.requestDate}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: 4,
                              backgroundColor:
                                req.status === 'APPROVED'
                                  ? 'var(--color-sage-subtle)'
                                  : req.status === 'REJECTED'
                                  ? 'var(--color-terracotta-light)'
                                  : 'var(--color-saffron-light)',
                              color:
                                req.status === 'APPROVED'
                                  ? 'var(--color-forest)'
                                  : req.status === 'REJECTED'
                                  ? 'var(--color-terracotta-dark)'
                                  : 'var(--color-saffron-dark)',
                            }}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => handleApprove(req.id, req.name)}
                                style={{
                                  backgroundColor: 'var(--color-forest)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 'var(--radius-xs)',
                                  padding: '4px 8px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(req.id, req.name)}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-terracotta)',
                                  border: '1px solid var(--color-cream-border)',
                                  borderRadius: 'var(--radius-xs)',
                                  padding: '4px 8px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
