import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  AlertCircle,
  Inbox,
  Calendar,
} from 'lucide-react';
import { useProperties } from '../contexts/PropertyContext';
import Money from '../components/Money';
import OwedBreakdown from '../components/OwedBreakdown';
import StatusBadge from '../components/StatusBadge';
import SplitActions from '../components/SplitActions';
import BillActivityTimeline from '../components/BillActivityTimeline';
import { effectiveStatus, isOutstanding } from '../lib/paymentStatus';
import { amountForFrequency } from '../lib/rentCalc';
import { todayLocal, financialYearFor } from '../lib/dates';
import ConfirmModal from '../components/ConfirmModal';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-tenant detail page — the landlord's "at a glance" view for one tenant.
// Reuses all context data already loaded by PropertyContext; no new queries.
// Route: /properties/:propertyId/tenants/:tenantId
const TenantDetail = () => {
  const { propertyId, tenantId } = useParams();
  const {
    properties,
    tenants,
    bills,
    billSplits,
    rentRates,
    loading,
    error,
    refresh,
    setBillSplitStatus,
    recordPartialPayment,
    sendBillEmail,
    revokeSplitToken,
    updateTenant,
    addRentRate,
  } = useProperties();

  const [sendingSplitId, setSendingSplitId] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [expandedBreakdownSplitId, setExpandedBreakdownSplitId] = useState(null);
  const [expandedActivitySplitId, setExpandedActivitySplitId] = useState(null);

  // Inline tenant edit — 2026-08-13: replaces the old "Edit tenant details"
  // link out to the property's full tenant list (find this tenant again,
  // click Edit again) with editing right here, since we're already looking
  // at this exact tenant.
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [tenantEditForm, setTenantEditForm] = useState(null);
  const [tenantEditError, setTenantEditError] = useState('');
  const [tenantEditSubmitting, setTenantEditSubmitting] = useState(false);
  const [tenantEditConfirm, setTenantEditConfirm] = useState(null);

  // Pagination: show 10 rows at a time, with a "Load more" button.
  const PAGE_SIZE = 10;
  const [rentPage, setRentPage] = useState(1);
  const [utilPage, setUtilPage] = useState(1);
  // 2026-08-13: financial-year filter — "10 rows max" pagination alone
  // wasn't enough once a tenant has multiple years of history; letting the
  // landlord jump straight to a specific FY (the unit they actually think
  // in for tax/reporting) beats paging through everything chronologically.
  const [rentYearFilter, setRentYearFilter] = useState('all');
  // 2026-08-17: bulk-select, mirroring Dashboard.js's work-queue bulk mark-
  // paid — Chris flagged this per-tenant Rent/Utilities list had no way to
  // select and settle more than one bill at a time.
  const [selectedSplitIds, setSelectedSplitIds] = useState([]);
  const [bulkMarking, setBulkMarking] = useState(false);
  const [utilYearFilter, setUtilYearFilter] = useState('all');

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-secondary-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-danger-600 mx-auto mb-3" />
        <p className="text-secondary-700 mb-4">Couldn't load data: {error}</p>
        <button onClick={refresh} className="btn-secondary">Try again</button>
      </div>
    );
  }

  const property = properties.find((p) => p.id === propertyId);
  const tenant = tenants.find((t) => t.id === tenantId);

  if (!property || !tenant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-secondary-600 mb-4">Tenant not found.</p>
        <Link to={`/properties/${propertyId}`} className="text-primary-600 hover:text-primary-700">
          Back to property
        </Link>
      </div>
    );
  }

  // Current open-ended rate (no effective_to) for this tenant.
  const currentRate = rentRates.filter((r) => r.tenant_id === tenantId).find((r) => !r.effective_to);

  const handleStartEditTenant = () => {
    setTenantEditForm({
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      room: tenant.room,
      moveInDate: tenant.move_in_date,
      moveOutDate: tenant.move_out_date || '',
      numberOfOccupants: tenant.number_of_occupants,
      rentAmount: currentRate ? String(currentRate.amount_cents / 100) : '',
      rentFrequency: currentRate ? currentRate.frequency : 'weekly',
    });
    setTenantEditError('');
    setIsEditingTenant(true);
  };

  const saveTenantEdit = async (rentAmount, shouldCreateRate) => {
    setTenantEditSubmitting(true);
    setTenantEditError('');
    try {
      await updateTenant(tenantId, {
        name: tenantEditForm.name.trim(),
        email: tenantEditForm.email.trim() || null,
        phone: tenantEditForm.phone.trim() || null,
        room: tenantEditForm.room.trim(),
        move_in_date: tenantEditForm.moveInDate,
        move_out_date: tenantEditForm.moveOutDate || null,
        number_of_occupants: tenantEditForm.numberOfOccupants,
      });
      if (shouldCreateRate) {
        await addRentRate(tenantId, {
          amountCents: Math.round(rentAmount * 100),
          frequency: tenantEditForm.rentFrequency,
          effectiveFrom: todayLocal(),
        });
      }
      setIsEditingTenant(false);
      setTenantEditForm(null);
    } catch (err) {
      console.error('Failed to save tenant:', err);
      setTenantEditError(err.message || 'Failed to save tenant');
    } finally {
      setTenantEditSubmitting(false);
    }
  };

  const handleTenantEditSubmit = (e) => {
    e.preventDefault();
    setTenantEditError('');
    if (!tenantEditForm.name.trim() || !tenantEditForm.room.trim()) {
      setTenantEditError('Name and room are required');
      return;
    }
    if (tenantEditForm.moveOutDate && tenantEditForm.moveOutDate < tenantEditForm.moveInDate) {
      setTenantEditError('Move-out date must be on or after the move-in date');
      return;
    }
    if (tenantEditForm.email.trim() && !EMAIL_PATTERN.test(tenantEditForm.email.trim())) {
      setTenantEditError('That email address doesn\'t look valid');
      return;
    }
    const rentAmount = parseFloat(tenantEditForm.rentAmount);
    if (tenantEditForm.rentAmount && (!rentAmount || rentAmount <= 0)) {
      setTenantEditError('Rent must be a positive amount, or left blank to keep unchanged');
      return;
    }
    // Same pattern as PropertyDetail.js's tenant edit — a changed rate always
    // starts a new dated rate (via addRentRate), never overwrites history.
    const rateChanged = Boolean(
      rentAmount &&
        currentRate &&
        (Math.round(rentAmount * 100) !== currentRate.amount_cents || tenantEditForm.rentFrequency !== currentRate.frequency)
    );
    const isFirstRate = Boolean(rentAmount && !currentRate);
    if (rateChanged) {
      setTenantEditConfirm({
        title: 'Start a new rate from today?',
        message: `This won't change any bill already sent — it starts a new rate effective today (${todayLocal()}), and the old rate stays exactly as it was for past bills.`,
        confirmLabel: 'Save & start new rate',
        onConfirm: () => {
          setTenantEditConfirm(null);
          saveTenantEdit(rentAmount, true);
        },
      });
      return;
    }
    saveTenantEdit(rentAmount, isFirstRate);
  };

  // Total outstanding across all bill types.
  const totalOwedCents = billSplits
    .filter((s) => s.tenant_id === tenantId && isOutstanding(s))
    .reduce((sum, s) => sum + Math.round(Number(s.owed_amount) * 100), 0);

  // Splits for this tenant, joined with their bills.
  const tenantSplits = billSplits
    .filter((s) => s.tenant_id === tenantId)
    .map((s) => ({ split: s, bill: bills.find((b) => b.id === s.bill_id) }))
    .filter((row) => row.bill);

  const allRentRows = tenantSplits
    .filter((row) => row.bill.bill_type === 'rent')
    .sort((a, b) => b.bill.billing_period_start.localeCompare(a.bill.billing_period_start));

  const allUtilRows = tenantSplits
    .filter((row) => row.bill.bill_type !== 'rent')
    .sort((a, b) => b.bill.billing_period_start.localeCompare(a.bill.billing_period_start));

  // Distinct financial years actually present in this tenant's history,
  // most recent first — only offered as filter options if there's more
  // than one, since a single-FY tenant has nothing to filter.
  const financialYearsFor = (rows) =>
    [...new Set(rows.map((row) => financialYearFor(row.bill.billing_period_start)))].sort().reverse();
  const rentFinancialYears = financialYearsFor(allRentRows);
  const utilFinancialYears = financialYearsFor(allUtilRows);

  const rentRows =
    rentYearFilter === 'all'
      ? allRentRows
      : allRentRows.filter((row) => financialYearFor(row.bill.billing_period_start) === rentYearFilter);
  const utilRows =
    utilYearFilter === 'all'
      ? allUtilRows
      : allUtilRows.filter((row) => financialYearFor(row.bill.billing_period_start) === utilYearFilter);

  const tenantById = (id) => tenants.find((t) => t.id === id);

  const toggleSelectSplit = (splitId) => {
    setSelectedSplitIds((prev) =>
      prev.includes(splitId) ? prev.filter((id) => id !== splitId) : [...prev, splitId]
    );
  };

  const handleBulkMarkPaid = async (rows) => {
    const ids = rows.map(({ split }) => split.id).filter((id) => selectedSplitIds.includes(id));
    if (ids.length === 0) return;
    if (!window.confirm(`Mark ${ids.length} bill${ids.length === 1 ? '' : 's'} as paid?`)) return;
    setBulkMarking(true);
    setEmailError('');
    try {
      for (const id of ids) {
        await setBillSplitStatus(id, 'paid');
      }
      setSelectedSplitIds((prev) => prev.filter((id) => !ids.includes(id)));
    } catch (err) {
      console.error('Bulk mark-paid failed:', err);
      setEmailError(err.message || 'Failed to mark some bills as paid');
    } finally {
      setBulkMarking(false);
    }
  };

  const handleRevokeLink = async (split) => {
    if (!window.confirm(`Revoke ${split.tenant_name}'s current bill link? The old link will stop working immediately.`)) return false;
    await revokeSplitToken(split.id);
    return true;
  };

  const handleSendEmail = async (split) => {
    const t = tenantById(split.tenant_id);
    if (!t?.email) {
      setEmailError(`${split.tenant_name} has no email on file. Add one to their tenant record first.`);
      return;
    }
    setEmailError('');
    setSendingSplitId(split.id);
    try {
      await sendBillEmail(split.id);
    } catch (err) {
      console.error('Failed to send bill email:', err);
      setEmailError(err.message || 'Failed to send email');
    } finally {
      setSendingSplitId(null);
    }
  };

  // Renders a single split row with its bill context — same visual language
  // as PropertyDetail's renderBillSplits table rows, adapted for a single-
  // tenant view where the "tenant" column is replaced by the bill period.
  const renderSplitRow = ({ split, bill }) => {
    const status = effectiveStatus(split, bill);

    return (
      <React.Fragment key={split.id}>
        {/* Desktop row */}
        <tr className="hidden sm:table-row border-b border-secondary-100 last:border-0">
          <td className="py-2 pr-2 w-6">
            <input
              type="checkbox"
              checked={selectedSplitIds.includes(split.id)}
              onChange={() => toggleSelectSplit(split.id)}
            />
          </td>
          <td className="py-2 pr-4">
            <p className="text-sm font-medium text-secondary-900">{bill.billing_period_start} to {bill.billing_period_end}</p>
            {bill.bill_type !== 'rent' && (
              <p className="text-xs text-secondary-500 capitalize">
                {bill.bill_type}{bill.description ? ` · ${bill.description}` : ''}
              </p>
            )}
            {bill.due_date && (
              <p className="text-xs text-secondary-400 flex items-center mt-0.5">
                <Calendar className="w-3 h-3 mr-1" />
                Due {bill.due_date}
              </p>
            )}
            {split.rate_breakdown && (
              <button
                onClick={() => setExpandedBreakdownSplitId((id) => (id === split.id ? null : split.id))}
                className="text-xs text-primary-600 hover:text-primary-700 mt-0.5 flex items-center"
              >
                {expandedBreakdownSplitId === split.id ? (
                  <><ChevronUp className="w-3 h-3 mr-0.5" />Hide breakdown</>
                ) : (
                  <><ChevronDown className="w-3 h-3 mr-0.5" />Rate breakdown</>
                )}
              </button>
            )}
          </td>
          <td className="py-2 pr-4 text-right">
            <Money dollars={split.owed_amount} className="text-secondary-900" />
            <OwedBreakdown split={split} />
          </td>
          <td className="py-2 pr-4 text-center">
            <StatusBadge status={status} />
          </td>
          <td className="py-2 text-right">
            <div className="flex items-center justify-end space-x-2">
              <SplitActions
                split={split}
                sendingSplitId={sendingSplitId}
                onRevoke={handleRevokeLink}
                onSetStatus={setBillSplitStatus}
                onRecordPayment={recordPartialPayment}
                onSendEmail={handleSendEmail}
                billHasAttachment={!!bill.attachment_path}
              />
              <button
                onClick={() => setExpandedActivitySplitId((id) => (id === split.id ? null : split.id))}
                className="text-xs text-secondary-400 hover:text-primary-600 whitespace-nowrap"
              >
                {expandedActivitySplitId === split.id ? 'Hide' : 'View'} activity
              </button>
            </div>
          </td>
        </tr>
        {/* Rate breakdown expansion row (desktop) */}
        {split.rate_breakdown && expandedBreakdownSplitId === split.id && (
          <tr className="hidden sm:table-row bg-secondary-50">
            <td colSpan={5} className="py-2 px-3">
              <ul className="text-xs text-secondary-600 space-y-1">
                {split.rate_breakdown.map((seg, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {seg.from} to {seg.to} ({seg.days} day{seg.days === 1 ? '' : 's'} @{' '}
                      <Money cents={seg.amountCents} />/week)
                    </span>
                    <Money cents={seg.cents} className="font-medium" />
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        )}
        {expandedActivitySplitId === split.id && (
          <tr className="hidden sm:table-row bg-secondary-50">
            <td colSpan={5} className="py-2 px-3">
              <BillActivityTimeline billId={bill.id} />
            </td>
          </tr>
        )}
        {/* Mobile card */}
        <tr className="sm:hidden">
          <td colSpan={5} className="py-2">
            <div className="border border-secondary-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedSplitIds.includes(split.id)}
                    onChange={() => toggleSelectSplit(split.id)}
                  />
                  <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {bill.billing_period_start} to {bill.billing_period_end}
                  </p>
                  {bill.bill_type !== 'rent' && (
                    <p className="text-xs text-secondary-500 capitalize">
                      {bill.bill_type}{bill.description ? ` · ${bill.description}` : ''}
                    </p>
                  )}
                  {bill.due_date && (
                    <p className="text-xs text-secondary-400 flex items-center mt-0.5">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due {bill.due_date}
                    </p>
                  )}
                  </div>
                </div>
                <div className="text-right">
                  <Money dollars={split.owed_amount} as="p" className="text-secondary-900 block mb-1" />
                  <OwedBreakdown split={split} />
                  <StatusBadge status={status} />
                </div>
              </div>
              {split.rate_breakdown && (
                <>
                  <button
                    onClick={() => setExpandedBreakdownSplitId((id) => (id === split.id ? null : split.id))}
                    className="text-xs text-primary-600 hover:text-primary-700 mb-2"
                  >
                    {expandedBreakdownSplitId === split.id ? 'Hide' : 'View'} rate breakdown
                  </button>
                  {expandedBreakdownSplitId === split.id && (
                    <ul className="text-xs text-secondary-600 space-y-1 mb-2 bg-secondary-50 rounded p-2">
                      {split.rate_breakdown.map((seg, i) => (
                        <li key={i} className="flex justify-between">
                          <span>
                            {seg.from} to {seg.to} ({seg.days}d @ <Money cents={seg.amountCents} />/week)
                          </span>
                          <Money cents={seg.cents} className="font-medium" />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
                <SplitActions
                  split={split}
                  sendingSplitId={sendingSplitId}
                  onRevoke={handleRevokeLink}
                  onSetStatus={setBillSplitStatus}
                  onRecordPayment={recordPartialPayment}
                  onSendEmail={handleSendEmail}
                  billHasAttachment={!!bill.attachment_path}
                />
                <button
                  onClick={() => setExpandedActivitySplitId((id) => (id === split.id ? null : split.id))}
                  className="text-xs text-secondary-400 hover:text-primary-600"
                >
                  {expandedActivitySplitId === split.id ? 'Hide' : 'View'} activity
                </button>
              </div>
              {expandedActivitySplitId === split.id && (
                <div className="mt-2 bg-secondary-50 rounded p-2">
                  <BillActivityTimeline billId={bill.id} />
                </div>
              )}
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const renderSection = (rows, page, setPage, icon, title, emptyMsg, yearOptions, yearFilter, setYearFilter) => {
    const visible = rows.slice(0, page * PAGE_SIZE);
    const hasMore = rows.length > visible.length;
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
            <span className="ml-2 text-secondary-400 font-normal normal-case">({rows.length})</span>
          </h2>
          {yearOptions.length > 1 && (
            <select
              className="input-field text-sm py-1.5"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All years</option>
              {yearOptions.map((fy) => (
                <option key={fy} value={fy}>FY {fy}</option>
              ))}
            </select>
          )}
        </div>
        {rows.length === 0 ? (
          <div className="card text-center py-8">
            <Inbox className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
            <p className="text-secondary-600 text-sm">{emptyMsg}</p>
          </div>
        ) : (
          <>
            {/* Bulk mark-paid — mirrors Dashboard.js's work-queue bulk action */}
            <div className="flex items-center space-x-3 mb-2 text-sm">
              <label className="flex items-center space-x-2 text-secondary-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visible.length > 0 && visible.every(({ split }) => selectedSplitIds.includes(split.id))}
                  onChange={(e) => {
                    const visibleIds = visible.map(({ split }) => split.id);
                    setSelectedSplitIds((prev) =>
                      e.target.checked
                        ? [...new Set([...prev, ...visibleIds])]
                        : prev.filter((id) => !visibleIds.includes(id))
                    );
                  }}
                />
                <span>Select all</span>
              </label>
              {selectedSplitIds.some((id) => rows.some(({ split }) => split.id === id)) && (
                <button
                  onClick={() => handleBulkMarkPaid(rows)}
                  disabled={bulkMarking}
                  className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  {bulkMarking
                    ? 'Marking...'
                    : `Mark ${selectedSplitIds.filter((id) => rows.some(({ split }) => split.id === id)).length} as paid`}
                </button>
              )}
            </div>
            <div className="card p-0 overflow-hidden">
              <table className="w-full">
                <thead className="hidden sm:table-header-group">
                  <tr className="text-left text-xs text-secondary-500 border-b border-secondary-200">
                    <th className="py-2 pl-4 w-6"></th>
                    <th className="py-2 px-4">Period</th>
                    <th className="py-2 px-4 text-right">Owed</th>
                    <th className="py-2 px-4 text-center">Status</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 sm:divide-y-0">
                  {visible.map(renderSplitRow)}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Load more ({rows.length - visible.length} remaining)
              </button>
            )}
          </>
        )}
      </section>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-secondary-500 mb-6" aria-label="Breadcrumb">
        <Link to="/dashboard" className="hover:text-secondary-900">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
        <Link to="/properties" className="hover:text-secondary-900">Properties</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
        <Link to={`/properties/${propertyId}`} className="hover:text-secondary-900">{property.name}</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
        <span className="text-secondary-900 font-medium">{tenant.name}</span>
      </nav>

      {/* Tenant header card */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{tenant.name}</h1>
            <p className="text-secondary-600 mt-0.5">{tenant.room} &middot; {property.name}</p>
            <div className="mt-3 space-y-1 text-sm text-secondary-600">
              <p>Moved in: <span className="text-secondary-900 font-medium">{tenant.move_in_date}</span></p>
              {tenant.move_out_date && (
                <p>Move-out: <span className="text-secondary-900 font-medium">{tenant.move_out_date}</span></p>
              )}
              {tenant.email && <p>Email: <span className="text-secondary-900">{tenant.email}</span></p>}
              {tenant.phone && <p>Phone: <span className="text-secondary-900">{tenant.phone}</span></p>}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Total outstanding</p>
            <Money
              cents={totalOwedCents}
              className={`text-2xl ${totalOwedCents > 0 ? 'text-secondary-900' : 'text-success-700'}`}
            />
            {currentRate ? (
              <p className="text-sm text-secondary-600 mt-2">
                Current rent:{' '}
                <span className="font-semibold text-secondary-900">
                  <Money cents={currentRate.amount_cents} />/week
                </span>
                {currentRate.frequency !== 'weekly' && (
                  <span className="text-secondary-500">
                    {' '}
                    (billed {currentRate.frequency}:{' '}
                    <Money cents={amountForFrequency(currentRate.amount_cents, currentRate.frequency)} />)
                  </span>
                )}
                <span className="text-secondary-400 text-xs ml-1">since {currentRate.effective_from}</span>
              </p>
            ) : (
              <p className="text-sm text-secondary-400 mt-2">No active rent rate</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-secondary-100">
          {!isEditingTenant ? (
            <button
              onClick={handleStartEditTenant}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit tenant details
            </button>
          ) : (
            <form onSubmit={handleTenantEditSubmit} className="space-y-4 bg-secondary-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={tenantEditForm.name}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Room</label>
                  <input
                    type="text"
                    className="input-field"
                    value={tenantEditForm.room}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, room: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Occupants in this room</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={tenantEditForm.numberOfOccupants}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, numberOfOccupants: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    className="input-field"
                    value={tenantEditForm.email}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Phone (optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={tenantEditForm.phone}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Move-in date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={tenantEditForm.moveInDate}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, moveInDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Move-out date (optional)</label>
                  <input
                    type="date"
                    className="input-field"
                    value={tenantEditForm.moveOutDate}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, moveOutDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-secondary-100">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Rent per week</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field pl-7"
                      placeholder="0.00"
                      value={tenantEditForm.rentAmount}
                      onChange={(e) => setTenantEditForm((p) => ({ ...p, rentAmount: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">Leave unchanged to keep the current rate.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-1.5">Billing frequency</label>
                  <select
                    className="input-field"
                    value={tenantEditForm.rentFrequency}
                    onChange={(e) => setTenantEditForm((p) => ({ ...p, rentFrequency: e.target.value }))}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="text-xs text-secondary-400 mt-1">Amount for this cadence is calculated automatically.</p>
                </div>
              </div>
              {tenantEditError && <p className="text-danger-600 text-sm">{tenantEditError}</p>}
              <div className="flex space-x-3">
                <button type="submit" disabled={tenantEditSubmitting} className="btn-primary">
                  {tenantEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditingTenant(false);
                    setTenantEditForm(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!tenantEditConfirm}
        title={tenantEditConfirm?.title}
        message={tenantEditConfirm?.message}
        confirmLabel={tenantEditConfirm?.confirmLabel}
        onConfirm={tenantEditConfirm?.onConfirm}
        onCancel={() => setTenantEditConfirm(null)}
      />

      {emailError && <p className="text-danger-600 text-sm mb-4">{emailError}</p>}

      {/* Rent splits */}
      {renderSection(
        rentRows,
        rentPage,
        setRentPage,
        <DollarSign className="w-4 h-4" />,
        'Rent',
        'No rent bills for this tenant yet.',
        rentFinancialYears,
        rentYearFilter,
        setRentYearFilter
      )}

      {/* Utility splits */}
      {renderSection(
        utilRows,
        utilPage,
        setUtilPage,
        <Zap className="w-4 h-4" />,
        'Utilities',
        'No utility bills for this tenant yet.',
        utilFinancialYears,
        utilYearFilter,
        setUtilYearFilter
      )}
    </div>
  );
};

export default TenantDetail;
