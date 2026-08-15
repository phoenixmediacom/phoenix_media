import { useState, useEffect } from "react";
import { useI18n } from "../../i18n";
import { useAsync } from "../../hooks/useAsync";
import {
  listContactSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
  markMultipleAsRead,
  archiveMultiple,
  deleteMultiple,
  exportSubmissions,       
  downloadExportedFile,     
  type SubmissionsFilters,
} from "../../services/endpoints/contact";
import type { ContactSubmission } from "../../services/types";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Form";
import { LoadingState, ErrorState } from "../../components/ui/AsyncStates";
import { Modal } from "../../components/ui/Modal";

export default function MessagesAdminPage() {
  const { t } = useI18n();

  // ✅ Filters & Pagination
  const [filters, setFilters] = useState<SubmissionsFilters>({
    status: undefined,
    search: "",
    page: 1,
    per_page: 20,
  });

  // ✅ Selected Messages (للإجراءات الجماعية)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ✅ Message Details Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // ✅ Fetch Messages
  const {
    data: messagesData,
    loading,
    error,
    refetch,
  } = useAsync(() => listContactSubmissions(filters), [filters]);

  const messages = messagesData?.data || [];
  const meta = messagesData?.meta;
  const stats = messagesData?.stats;

  // ✅ Handle Search
  const [searchInput, setSearchInput] = useState("");
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // ✅ Handle Filter Change
  function handleFilterChange(status: SubmissionsFilters['status']) {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
    setSelectedIds(new Set());
  }

  // ✅ Handle Page Change
  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedIds(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ✅ Toggle Selection
  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  // ✅ Select/Deselect All
  function toggleSelectAll() {
    if (selectedIds.size === messages.length && messages.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m: ContactSubmission) => m.id)));
    }
  }

  // ✅ Add Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ✅ Export Function
  async function handleExport(format: 'xlsx' | 'csv', type: 'all' | 'filtered' | 'selected') {
    setExportLoading(true);
    
    try {
      const params: any = { format, type };
      
      if (type === 'filtered') {
        params.filters = filters;
      } else if (type === 'selected') {
        params.selectedIds = Array.from(selectedIds);
      }
  
      const blob = await exportSubmissions(params);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `contact-submissions-${type}-${timestamp}.${format}`;
      
      downloadExportedFile(blob, filename);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export messages. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }
  // ✅ View Message Details
  async function viewMessage(message: ContactSubmission) {
    setSelectedMessage(message);
    setIsModalOpen(true);

    // Mark as read if new
    if (message.status === 'new') {
      try {
        await updateSubmissionStatus(message.id, 'read');
        refetch();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  }

  // ✅ Bulk Actions
  async function handleBulkAction(action: 'read' | 'archived' | 'delete') {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);

    try {
      if (action === 'read') {
        await markMultipleAsRead(ids);
      } else if (action === 'archived') {
        await archiveMultiple(ids);
      } else if (action === 'delete') {
        if (!confirm(t.admin.messages.deleteConfirm)) return;
        await deleteMultiple(ids);
      }

      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      alert(`Failed to ${action} messages. Please try again.`);
    }
  }

  // ✅ Single Message Actions
  async function handleMessageAction(
    id: string,
    action: 'read' | 'replied' | 'archived' | 'delete'
  ) {
    try {
      if (action === 'delete') {
        if (!confirm(t.admin.messages.deleteConfirm)) return;
        await deleteSubmission(id);
      } else {
        await updateSubmissionStatus(id, action);
      }
      refetch();
      if (isModalOpen) setIsModalOpen(false);
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      alert(`Failed to ${action} message. Please try again.`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-md text-on-surface">
            {t.admin.messages.title}
          </h1>
          {stats && (
            <p className="text-sm text-on-surface-variant mt-1">
              {stats.total} {t.admin.messages.allMessages.toLowerCase()}
              {stats.new > 0 && (
                <span className="text-error font-semibold ml-2">
                  • {stats.new} {t.admin.messages.newMessages.toLowerCase()}
                </span>
              )}
            </p>
          )}
        </div>

        {/* ✅ Export Button */}
        <Button
          onClick={() => setShowExportModal(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          📊 Export Messages
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="glass rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <Input
              type="search"
              placeholder={t.admin.messages.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status || ""}
              onChange={(e) => {
                const value = e.target.value;
                const validStatuses = ['new', 'read', 'replied', 'archived'];
                handleFilterChange(
                  value && validStatuses.includes(value) 
                    ? value as 'new' | 'read' | 'replied' | 'archived'
                    : undefined
                );
              }}
              className="w-full"
            >
              <option value="">{t.admin.messages.allMessages}</option>
              <option value="new">{t.admin.messages.newMessages}</option>
              <option value="read">{t.admin.messages.readMessages}</option>
              <option value="replied">{t.admin.messages.repliedMessages}</option>
              <option value="archived">{t.admin.messages.archivedMessages}</option>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <StatCard label={t.admin.messages.allMessages} value={stats.total} />
            <StatCard
              label={t.admin.messages.newMessages}
              value={stats.new}
              highlight
            />
            <StatCard label={t.admin.messages.readMessages} value={stats.read} />
            <StatCard label={t.admin.messages.repliedMessages} value={stats.replied} />
            <StatCard label={t.admin.messages.archivedMessages} value={stats.archived} />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">
            {selectedIds.size} {t.admin.messages.selected}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAction('read')}
            >
              {t.admin.messages.markAsRead}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAction('archived')}
            >
              {t.admin.messages.archive}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkAction('delete')}
              className="text-error hover:bg-error/10"
            >
              {t.admin.messages.delete}
            </Button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        
        {!loading && !error && messages.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-on-surface-variant">{t.admin.messages.noMessages}</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <>
            {/* Table Header */}
            <div className="bg-surface-container-high p-4 border-b border-glass-border">
              <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-on-surface-variant uppercase">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === messages.length && messages.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-outline-variant"
                  />
                </div>
                <div className="col-span-3">{t.admin.messages.sender}</div>
                <div className="col-span-4">Message</div>
                <div className="col-span-2">{t.admin.messages.receivedAt}</div>
                <div className="col-span-1">{t.admin.messages.status}</div>
                <div className="col-span-1 text-center">{t.admin.messages.actions}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-glass-border">
              {messages.map((message: ContactSubmission) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  isSelected={selectedIds.has(message.id)}
                  onToggleSelect={() => toggleSelection(message.id)}
                  onView={() => viewMessage(message)}
                  onAction={handleMessageAction}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="p-4 border-t border-glass-border flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {meta.from} to {meta.to} of {meta.total} messages
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === meta.last_page ||
                          Math.abs(page - meta.current_page) <= 2
                      )
                      .map((page, idx, arr) => (
                        <>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span key={`ellipsis-${page}`} className="px-2 py-1">
                              ...
                            </span>
                          )}
                          <Button
                            key={page}
                            size="sm"
                            variant={
                              page === meta.current_page ? "primary" : "secondary"
                            }
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </>
                      ))}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMessage(null);
          }}
          onAction={handleMessageAction}
          t={t}
        />
      )}

      {/* ✅ Export Modal */}
      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Messages"
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm text-on-surface-variant">
            Choose export format and type:
          </p>
      
          {/* Export Options */}
          <div className="space-y-4">
            {/* All Messages */}
            <div className="glass rounded-xl p-4">
              <h4 className="font-semibold mb-3">Export All Messages</h4>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExport('xlsx', 'all')}
                  disabled={exportLoading}
                  className="flex-1"
                >
                  📊 Excel (.xlsx)
                </Button>
                <Button
                  onClick={() => handleExport('csv', 'all')}
                  disabled={exportLoading}
                  variant="secondary"
                  className="flex-1"
                >
                  📄 CSV
                </Button>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Export all {stats?.total || 0} messages
              </p>
            </div>
      
            {/* Filtered Messages */}
            {(filters.status || filters.search) && (
              <div className="glass rounded-xl p-4">
                <h4 className="font-semibold mb-3">Export Filtered Results</h4>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleExport('xlsx', 'filtered')}
                    disabled={exportLoading}
                    className="flex-1"
                  >
                    📊 Excel (.xlsx)
                  </Button>
                  <Button
                    onClick={() => handleExport('csv', 'filtered')}
                    disabled={exportLoading}
                    variant="secondary"
                    className="flex-1"
                  >
                    📄 CSV
                  </Button>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  Export current filter results
                  {filters.status && ` (Status: ${filters.status})`}
                </p>
              </div>
            )}
      
            {/* Selected Messages */}
            {selectedIds.size > 0 && (
              <div className="glass rounded-xl p-4 border-2 border-primary">
                <h4 className="font-semibold mb-3">Export Selected Messages</h4>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleExport('xlsx', 'selected')}
                    disabled={exportLoading}
                    className="flex-1"
                  >
                    📊 Excel (.xlsx)
                  </Button>
                  <Button
                    onClick={() => handleExport('csv', 'selected')}
                    disabled={exportLoading}
                    variant="secondary"
                    className="flex-1"
                  >
                    📄 CSV
                  </Button>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  Export {selectedIds.size} selected messages
                </p>
              </div>
            )}
          </div>
      
          {exportLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin text-4xl">⏳</div>
              <p className="text-sm text-on-surface-variant mt-2">Preparing export...</p>
            </div>
          )}
        </div>
      </Modal>
      
    </div>
  );
}

// ✅ Stats Card Component
function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg text-center ${
        highlight ? "bg-error/10" : "bg-surface-container-high"
      }`}
    >
      <p
        className={`font-display text-2xl font-bold ${
          highlight ? "text-error" : "text-on-surface"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}

// ✅ Message Row Component
function MessageRow({
  message,
  isSelected,
  onToggleSelect,
  onView,
  onAction,
}: {
  message: ContactSubmission;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onAction: (id: string, action: 'read' | 'replied' | 'archived' | 'delete') => void;
}) {
  const statusColors = {
    new: "bg-error text-on-error",
    read: "bg-surface-container-high text-on-surface-variant",
    replied: "bg-primary text-on-primary",
    archived: "bg-surface-variant text-on-surface-variant",
  };

  const statusLabels = {
    new: "New",
    read: "Read",
    replied: "Replied",
    archived: "Archived",
  };

  return (
    <div
      className={`p-4 hover:bg-surface-container-high transition-colors ${
        message.status === "new" ? "bg-primary/5" : ""
      }`}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Checkbox */}
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-outline-variant"
          />
        </div>

        {/* Sender Info */}
        <div className="col-span-3">
          <p
            className={`font-medium text-sm ${
              message.status === "new" ? "text-on-surface font-bold" : "text-on-surface"
            }`}
          >
            {message.name}
          </p>
          <p className="text-xs text-on-surface-variant truncate">{message.email}</p>
          {message.phone && (
            <p className="text-xs text-on-surface-variant">{message.phone}</p>
          )}
        </div>

        {/* Message Preview */}
        <div className="col-span-4">
          <p className="text-sm text-on-surface-variant line-clamp-2">
            {message.message}
          </p>
        </div>

        {/* Date */}
        <div className="col-span-2">
          <p className="text-xs text-on-surface-variant">
            {new Date(message.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-on-surface-variant">
            {new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Status Badge */}
        <div className="col-span-1">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              statusColors[message.status]
            }`}
          >
            {statusLabels[message.status]}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-center gap-1">
          <button
            onClick={onView}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors"
            title="View Details"
          >
            👁️
          </button>
          <button
            onClick={() => onAction(message.id, 'delete')}
            className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
    
  );
}

// ✅ Message Details Modal
function MessageDetailsModal({
  message,
  open,
  onClose,
  onAction,
  t,
}: {
  message: ContactSubmission;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: 'read' | 'replied' | 'archived' | 'delete') => void;
  t: any;
}) {
  return (
    <Modal open={open} onClose={onClose} title={t.admin.messages.messageDetails}>
      <div className="flex flex-col gap-6">
        {/* Sender Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-on-surface mb-4">
            {t.admin.messages.sender}
          </h3>
          <div className="space-y-3">
            <InfoRow label="Name" value={message.name} />
            <InfoRow label="Email" value={message.email} />
            {message.phone && <InfoRow label="Phone" value={message.phone} />}
            <InfoRow
              label="Status"
              value={
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    message.status === "new"
                      ? "bg-error text-on-error"
                      : message.status === "replied"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {message.status.toUpperCase()}
                </span>
              }
            />
            <InfoRow
              label={t.admin.messages.receivedAt}
              value={new Date(message.createdAt).toLocaleString()}
            />
            {message.readAt && (
              <InfoRow
                label="Read At"
                value={new Date(message.readAt).toLocaleString()}
              />
            )}
            {message.ipAddress && (
              <InfoRow label={t.admin.messages.ipAddress} value={message.ipAddress} />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-on-surface mb-4">Message</h3>
          <p className="text-on-surface whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <a
            href={`mailto:${message.email}`}
            className="flex-1 bg-primary text-on-primary px-4 py-3 rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
          >
            ✉️ {t.admin.messages.replyByEmail}
          </a>
          
          {message.status === 'new' && (
            <Button
              variant="secondary"
              onClick={() => onAction(message.id, 'read')}
              className="flex-1"
            >
              {t.admin.messages.markAsRead}
            </Button>
          )}
          
          {message.status !== 'replied' && (
            <Button
              variant="secondary"
              onClick={() => onAction(message.id, 'replied')}
              className="flex-1"
            >
              {t.admin.messages.markAsReplied}
            </Button>
          )}
          
          {message.status !== 'archived' && (
            <Button
              variant="secondary"
              onClick={() => onAction(message.id, 'archived')}
              className="flex-1"
            >
              {t.admin.messages.archive}
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={() => onAction(message.id, 'delete')}
            className="text-error hover:bg-error/10"
          >
            {t.admin.messages.delete}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-glass-border last:border-0">
      <span className="text-sm text-on-surface-variant font-medium">{label}</span>
      <span className="text-sm text-on-surface">{value}</span>
    </div>
  );
}