import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useFoodLoop } from '../../context/FoodLoopContext';
import { analyticsService } from '../../services/analyticsService';
import { foodLoopService } from '../../services/foodLoopService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../../data/hostels';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  Table,
  Sparkles,
  Info
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const { mealRecords, donations, wasteRecords, pickups } = useFoodLoop();

  // Report configuration
  const [reportType, setReportType] = useState('CAMPUS_SUMMARY'); // 'CAMPUS_SUMMARY' | 'HOSTEL_PERFORMANCE' | 'WASTE_RECORDS' | 'DONATION_RECORDS' | 'CLAIMS_PICKUPS'
  const [period, setPeriod] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [category, setCategory] = useState('ALL');
  const [messId, setMessId] = useState('ALL');

  // Preview data
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadPreview = async () => {
      setLoading(true);
      const filter = { period, category, messId };

      try {
        if (reportType === 'CAMPUS_SUMMARY') {
          const m = await analyticsService.getCampusMetrics(filter);
          if (mounted) setPreviewData({ type: 'CAMPUS_SUMMARY', data: m });
        } else if (reportType === 'HOSTEL_PERFORMANCE') {
          const list = await analyticsService.getHostelComparison(filter);
          if (mounted) setPreviewData({ type: 'HOSTEL_PERFORMANCE', data: Array.isArray(list) ? list : [] });
        } else if (reportType === 'WASTE_RECORDS') {
          const w = await analyticsService.getWasteBreakdown(filter);
          if (mounted) setPreviewData({ type: 'WASTE_RECORDS', data: (w && Array.isArray(w.records)) ? w.records : [] });
        } else if (reportType === 'DONATION_RECORDS') {
          let rawDons = await foodLoopService.getDonations(messId !== 'ALL' ? messId : null);
          if (!Array.isArray(rawDons)) rawDons = [];
          if (category !== 'ALL') {
            rawDons = rawDons.filter((d) => {
              const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === d.messId);
              return h && h.category === category;
            });
          }
          if (period !== 'ALL') {
            rawDons = rawDons.filter((d) => analyticsService.isDateInFilter(d.createdAt, period));
          }
          if (mounted) setPreviewData({ type: 'DONATION_RECORDS', data: rawDons });
        } else if (reportType === 'CLAIMS_PICKUPS') {
          let rawPkus = await foodLoopService.getPickups();
          if (!Array.isArray(rawPkus)) rawPkus = [];
          if (messId !== 'ALL') {
            rawPkus = rawPkus.filter((p) => p.messId === messId);
          }
          if (category !== 'ALL') {
            rawPkus = rawPkus.filter((p) => {
              const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === p.messId);
              return h && h.category === category;
            });
          }
          if (period !== 'ALL') {
            rawPkus = rawPkus.filter((p) => analyticsService.isDateInFilter(p.createdAt || p.claimedAt, period));
          }
          if (mounted) setPreviewData({ type: 'CLAIMS_PICKUPS', data: rawPkus });
        }
      } catch (err) {
        console.error('Error generating report preview:', err);
        if (mounted) setPreviewData({ type: reportType, data: [] });
      }

      if (mounted) setLoading(false);
    };

    loadPreview();
    return () => {
      mounted = false;
    };
  }, [reportType, period, category, messId, mealRecords, donations, wasteRecords, pickups]);

  const handleExportCsv = async () => {
    const filter = { period, category, messId };
    const res = await analyticsService.exportReportCsv(reportType, filter);
    setExportNotice(`Downloaded ${res.filename} (${res.rowsCount} records)`);
    setTimeout(() => setExportNotice(''), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Sustainability Reports">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="kicker kicker-forest" style={{ marginBottom: 6 }}>
              <span>Data Auditing & Compliance</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
                color: 'var(--color-forest-dark)',
                margin: '0 0 6px 0',
              }}
            >
              Sustainability Reports & Exports
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0 }}>
              Export live campus food redistribution records and waste audit logs as verified CSV spreadsheets.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={15} />
              <span>Print View</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--color-forest)' }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Export Notification */}
        {exportNotice && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--color-sage-subtle)',
              border: '1.5px solid var(--color-sage)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-forest)',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Report Configuration Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            alignItems: 'flex-end',
          }}
        >
          {/* Report Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', marginBottom: 4 }}>
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', fontSize: '0.86rem', backgroundColor: '#FFFFFF', outline: 'none' }}
            >
              <option value="CAMPUS_SUMMARY">Campus Summary Report</option>
              <option value="HOSTEL_PERFORMANCE">Hostel Performance Table</option>
              <option value="WASTE_RECORDS">Waste Discard Audit Records</option>
              <option value="DONATION_RECORDS">Donation Batches Directory</option>
              <option value="CLAIMS_PICKUPS">Claims & Pickups Handover Log</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', marginBottom: 4 }}>
              Period Window
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', fontSize: '0.86rem', backgroundColor: '#FFFFFF', outline: 'none' }}
            >
              <option value="ALL">All Time History</option>
              <option value="TODAY">Today (Single Day)</option>
              <option value="WEEK">This Week (Last 7 Days)</option>
              <option value="MONTH">This Month (Last 30 Days)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', marginBottom: 4 }}>
              Hostel Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setMessId('ALL');
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', fontSize: '0.86rem', backgroundColor: '#FFFFFF', outline: 'none' }}
            >
              <option value="ALL">All Hostels (7)</option>
              <option value="BOYS">Boys' Hostels (4)</option>
              <option value="GIRLS">Girls' Hostels (3)</option>
            </select>
          </div>

          {/* Specific Mess */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-forest-dark)', textTransform: 'uppercase', marginBottom: 4 }}>
              Specific Dining Mess
            </label>
            <select
              value={messId}
              onChange={(e) => setMessId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', fontSize: '0.86rem', backgroundColor: '#FFFFFF', outline: 'none' }}
            >
              <option value="ALL">All 7 Messes</option>
              {CHITKARA_CAMPUS_DIRECTORY.filter((h) => category === 'ALL' || h.category === category).map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Report Preview Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-cream-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px 28px',
          }}
          className="printable-report"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-cream-border)', paddingBottom: 14, marginBottom: 20 }}>
            <div>
              <span className="kicker kicker-forest">Live Dataset Preview</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-forest-dark)', margin: '4px 0 0 0' }}>
                {reportType === 'CAMPUS_SUMMARY' && 'Campus Redistribution Summary'}
                {reportType === 'HOSTEL_PERFORMANCE' && 'Hostel Performance Comparison'}
                {reportType === 'WASTE_RECORDS' && 'Discarded Surplus Audit Log'}
                {reportType === 'DONATION_RECORDS' && 'Campus Donation Records'}
                {reportType === 'CLAIMS_PICKUPS' && 'Collection Handover Log'}
              </h3>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Export Format: <strong>CSV (RFC 4180 Escaped)</strong>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              Generating report preview...
            </div>
          ) : !previewData ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No data available for preview.
            </div>
          ) : (
            <div>
              {reportType === 'CAMPUS_SUMMARY' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-cream-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Prepared</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      {previewData.data.totalPrepared} portions
                    </div>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-cream-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Served</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      {previewData.data.totalServed} portions
                    </div>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-saffron-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-saffron-dark)' }}>Total Surplus</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-saffron-dark)' }}>
                      {previewData.data.totalSurplus} portions
                    </div>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-sage-subtle)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-forest)' }}>Food Donated</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {previewData.data.foodDonated} portions
                    </div>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-terracotta-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-terracotta-dark)' }}>Food Wasted</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-terracotta-dark)' }}>
                      {previewData.data.foodWasted} portions
                    </div>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--color-cream-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Redistribution Rate</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {previewData.data.redistributionRate}
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'HOSTEL_PERFORMANCE' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                        <th style={{ padding: '8px 12px' }}>Hostel Mess</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Prepared</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Served</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Surplus</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Donated</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Wasted</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Remaining</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Redist. %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(previewData.data) && previewData.data.length > 0 ? (
                        previewData.data.map((h) => (
                          <tr key={h.messId} style={{ borderBottom: '1px solid var(--color-cream-border)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{h.messName}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{h.totalPrepared}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{h.totalServed}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{h.totalSurplus}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--color-forest)', fontWeight: 700 }}>{h.foodDonated}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--color-terracotta)', fontWeight: 700 }}>{h.foodWasted}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{h.remainingFood}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--color-forest)', fontWeight: 700 }}>{h.redistributionRate}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No hostel data found for selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'WASTE_RECORDS' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                        <th style={{ padding: '8px 12px' }}>Timestamp</th>
                        <th style={{ padding: '8px 12px' }}>Hostel Mess</th>
                        <th style={{ padding: '8px 12px' }}>Food Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Portions Discarded</th>
                        <th style={{ padding: '8px 12px' }}>Reason</th>
                        <th style={{ padding: '8px 12px' }}>Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(previewData.data) && previewData.data.length > 0 ? (
                        previewData.data.map((w) => (
                          <tr key={w.id} style={{ borderBottom: '1px solid var(--color-cream-border)' }}>
                            <td style={{ padding: '8px 12px' }}>{new Date(w.discardedAt).toLocaleDateString()}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{w.messName}</td>
                            <td style={{ padding: '8px 12px' }}>{w.foodName}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-terracotta)' }}>{w.portionsDiscarded}</td>
                            <td style={{ padding: '8px 12px' }}>{w.reason}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{w.notes || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No waste records found for selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'DONATION_RECORDS' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                        <th style={{ padding: '8px 12px' }}>Food Name</th>
                        <th style={{ padding: '8px 12px' }}>Source Mess</th>
                        <th style={{ padding: '8px 12px' }}>Dietary</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Portions</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                        <th style={{ padding: '8px 12px' }}>Claimed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(previewData.data) && previewData.data.length > 0 ? (
                        previewData.data.map((d) => (
                          <tr key={d.id} style={{ borderBottom: '1px solid var(--color-cream-border)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{d.foodName}</td>
                            <td style={{ padding: '8px 12px' }}>{d.messName}</td>
                            <td style={{ padding: '8px 12px' }}>{d.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{d.portions}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700 }}>{d.status}</td>
                            <td style={{ padding: '8px 12px' }}>{d.claimedByNGO ? d.claimedByNGO.name : 'Unclaimed'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No donation batches found for selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'CLAIMS_PICKUPS' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-cream-tint)', borderBottom: '1.5px solid var(--color-cream-border)' }}>
                        <th style={{ padding: '8px 12px' }}>Pickup ID</th>
                        <th style={{ padding: '8px 12px' }}>Food Item</th>
                        <th style={{ padding: '8px 12px' }}>Source Mess</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Portions</th>
                        <th style={{ padding: '8px 12px' }}>NGO Account</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(previewData.data) && previewData.data.length > 0 ? (
                        previewData.data.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--color-cream-border)' }}>
                            <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{p.id}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.foodName}</td>
                            <td style={{ padding: '8px 12px' }}>{p.messName}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{p.portions}</td>
                            <td style={{ padding: '8px 12px' }}>{p.ngoName || 'NGO Partner'}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700 }}>{p.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No collection pickup records found for selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
