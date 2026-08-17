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
import { effectiveStatus, isOutstanding } from '../lib/paymentStatus';
import { amountForFrequency } from '../lib/rentCalc';

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
  } = useProperties();

  const [sendingSplitId, setSendingSplitId] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [expandedBreakdownSplitId, setExpandedBreakdownSplitId] = useState(null);

  // Pagination: show 10 rows at a time, with a "Load more" button.
  const PAGE_SIZE = 10;
  const [rentPage, setRentPage] = useState(1);
  const [utilPage, setUtilPage] = useState(1);

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

  // Total outstanding across all bill types.
  const totalOwedCents = billSplits
    .filter((s) => s.tenant_id === tenantId && isOutstanding(s))
    .reduce((sum, s) => sum + Math.round(Number(s.owed_amount) * 100), 0);

  // Splits for this tenant, joined with their bills.
  const tenantSplits = billSplits
    .filter((s) => s.tenant_id === tenantId)
    .map((s) => ({ split: s, bill: bills.find((b) => b.id === s.bill_id) }))
    .filter((row) => row.bill);

  const rentRows = tenantSplits
    .filter((row) => row.bill.bill_type === 'rent')
    .sort((a, b) => b.bill.billing_period_start.localeCompare(a.bill.billing_period_start));

  const utilRows = tenantSplits
    .filter((row) => row.bill.bill_type !== 'rent')
    .sort((a, b) => b.bill.billing_period_start.localeCompare(a.bill.billing_period_start));

  const tenantById = (id) => tenants.find((t) => t.id === id);

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
            <SplitActions
              split={split}
              sendingSplitId={sendingSplitId}
              onRevoke={handleRevokeLink}
              onSetStatus={setBillSplitStatus}
              onRecordPayment={recordPartialPayment}
              onSendEmail={handleSendEmail}
              billHasAttachment={!!bill.attachment_path}
            />
          </td>
        </tr>
        {/* Rate breakdown expansion row (desktop) */}
        {split.rate_breakdown && expandedBreakdownSplitId === split.id && (
          <tr className="hidden sm:table-row bg-secondary-50">
            <td colSpan={4} className="py-2 px-3">
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
        {/* Mobile card */}
        <tr className="sm:hidden">
          <td colSpan={4} className="py-2">
            <div className="border border-secondary-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
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
              </div>
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const renderSection = (rows, page, setPage, icon, title, emptyMsg) => {
    const visible = rows.slice(0, page * PAGE_SIZE);
    const hasMore = rows.length > visible.length;
    return (
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-secondary-400 font-normal normal-case">({rows.length})</span>
        </h2>
        {rows.length === 0 ? (
          <div className="card text-center py-8">
            <Inbox className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
            <p className="text-secondary-600 text-sm">{emptyMsg}</p>
          </div>
        ) : (
          <>
            <div className="card p-0 overflow-hidden">
              <table className="w-full">
                <thead className="hidden sm:table-header-group">
                  <tr className="text-left text-xs text-secondary-500 border-b border-secondary-200">
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
          <Link
            to={`/properties/${propertyId}?tab=tenants`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit tenant details &rarr;
          </Link>
        </div>
      </div>

      {emailError && <p className="text-danger-600 text-sm mb-4">{emailError}</p>}

      {/* Rent splits */}
      {renderSection(
        rentRows,
        rentPage,
        setRentPage,
        <DollarSign className="w-4 h-4" />,
        'Rent',
        'No rent bills for this tenant yet.'
      )}

      {/* Utility splits */}
      {renderSection(
        utilRows,
        utilPage,
        setUtilPage,
        <Zap className="w-4 h-4" />,
        'Utilities',
        'No utility bills for this tenant yet.'
      )}
    </div>
  );
};

export default TenantDetail;
