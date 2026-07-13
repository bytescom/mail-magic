"use client"
import React, { useState, useEffect, useCallback } from 'react'
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2,
    FiCopy, FiPlay, FiFilter, FiCalendar, FiEye, FiLoader
} from 'react-icons/fi';
import { Playfair_Display } from "next/font/google";
import CampaignBuilder from './CampaignBuilder';
import TemplateEditorModal from './TemplateEditorModal';

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// ── Helpers ──────────────────────────────────────────────────────────────────
const CARD_COLORS = ['bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100', 'bg-pink-100'];
const statusStyles = {
    'Draft':     'bg-gray-100  text-gray-700  border-gray-200',
    'Running':   'bg-blue-50   text-blue-600  border-blue-200',
    'Completed': 'bg-green-50  text-green-600 border-green-200',
    'Scheduled': 'bg-purple-50 text-purple-600 border-purple-200',
    'Failed':    'bg-red-50    text-red-600   border-red-200',
};
const dotColors = {
    'Draft': 'bg-gray-500', 'Running': 'bg-blue-500', 'Completed': 'bg-green-500',
    'Scheduled': 'bg-purple-500', 'Failed': 'bg-red-500',
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const timeAgo = (d) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-muted">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-[13px] font-medium">Loading...</p>
    </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ label, onAction, actionLabel }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[260px] gap-3 text-muted">
        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
            <FiPlay size={20} className="text-muted" />
        </div>
        <p className="text-[14px] font-bold text-text-dark">{label}</p>
        {onAction && (
            <button onClick={onAction} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-primary/90 transition-colors cursor-pointer">
                {actionLabel}
            </button>
        )}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
const Outreach = () => {
    const [activeTab, setActiveTab] = useState('Campaigns');
    const [isBuilding, setIsBuilding] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [templateCategory, setTemplateCategory] = useState('All Templates');
    const [sendingId, setSendingId] = useState(null); // id of campaign being sent
    const [sendResult, setSendResult] = useState(null); // { sent, total, failed, status }

    const [campaigns, setCampaigns] = useState([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);

    // ── Template State ───────────────────────────────────────────────────────
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);

    // ── Fetch Data ───────────────────────────────────────────────────────────
    const fetchCampaigns = useCallback(async () => {
        setCampaignsLoading(true);
        try {
            const res = await fetch('/api/outreach/campaigns');
            const data = await res.json();
            if (data.campaigns) setCampaigns(data.campaigns);
        } catch (e) {
            console.error('Failed to fetch campaigns', e);
        } finally {
            setCampaignsLoading(false);
        }
    }, []);

    const fetchTemplates = useCallback(async () => {
        setTemplatesLoading(true);
        try {
            const res = await fetch('/api/outreach/templates');
            const data = await res.json();
            if (data.templates) setTemplates(data.templates);
        } catch (e) {
            console.error('Failed to fetch templates', e);
        } finally {
            setTemplatesLoading(false);
        }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);
    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    // ── Campaign Actions ─────────────────────────────────────────────────────
    const handleDeleteCampaign = async (id) => {
        if (!confirm('Delete this campaign? This cannot be undone.')) return;
        await fetch(`/api/outreach/campaigns/${id}`, { method: 'DELETE' });
        setCampaigns(prev => prev.filter(c => c._id !== id));
    };

    const handleDuplicateCampaign = async (campaign) => {
        const res = await fetch('/api/outreach/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `${campaign.name} (Copy)`,
                senderEmail: campaign.senderEmail,
                templateId: campaign.templateId,
                templateSnapshot: campaign.templateSnapshot,
                audienceIds: campaign.audienceIds,
                attachments: campaign.attachments,
                trackOpens: campaign.trackOpens,
                trackReplies: campaign.trackReplies,
                stopAfterReply: campaign.stopAfterReply,
                status: 'Draft',
            }),
        });
        const data = await res.json();
        if (data.campaign) setCampaigns(prev => [data.campaign, ...prev]);
    };

    const handleLaunchCampaign = async (id) => {
        if (!confirm('Launch this campaign? Emails will be sent immediately to all selected leads.')) return;
        setSendingId(id);
        setSendResult(null);
        try {
            const res = await fetch(`/api/outreach/campaigns/${id}/send`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                alert(`Launch failed: ${data.error || 'Unknown error'}`);
                return;
            }
            setSendResult(data);
            // Refresh the campaigns list to reflect new status + sentCount
            await fetchCampaigns();
        } catch (e) {
            alert('Network error while launching campaign.');
        } finally {
            setSendingId(null);
        }
    };

    // ── Template Actions ─────────────────────────────────────────────────────
    const handleDeleteTemplate = async (id) => {
        if (!confirm('Delete this template? This cannot be undone.')) return;
        await fetch(`/api/outreach/templates/${id}`, { method: 'DELETE' });
        setTemplates(prev => prev.filter(t => t._id !== id));
    };

    const handleSaveTemplate = async (templateData) => {
        if (editingTemplate) {
            // Update existing
            const res = await fetch(`/api/outreach/templates/${editingTemplate._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData),
            });
            const data = await res.json();
            if (data.template) setTemplates(prev => prev.map(t => t._id === editingTemplate._id ? data.template : t));
        } else {
            // Create new
            const res = await fetch('/api/outreach/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData),
            });
            const data = await res.json();
            if (data.template) setTemplates(prev => [data.template, ...prev]);
        }
        setEditingTemplate(null);
        setIsTemplateModalOpen(false);
    };

    const openEditTemplate = (template) => {
        setEditingTemplate(template);
        setIsTemplateModalOpen(true);
    };

    const handleDuplicateTemplate = async (template) => {
        const res = await fetch('/api/outreach/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `${template.name} (Copy)`,
                subject: template.subject,
                body: template.body,
                category: template.category,
            }),
        });
        const data = await res.json();
        if (data.template) setTemplates(prev => [data.template, ...prev]);
    };

    const openNewTemplate = () => {
        setEditingTemplate(null);
        setIsTemplateModalOpen(true);
    };

    // ── Builder Handlers ─────────────────────────────────────────────────────
    const handleBuilderClose = () => {
        setIsBuilding(false);
        setEditingCampaign(null);
        fetchCampaigns(); // Refresh list after close
    };

    // ── Filter Logic ─────────────────────────────────────────────────────────
    const filteredCampaigns = campaigns
        .filter(c => statusFilter === 'All' || c.status === statusFilter)
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredTemplates = templates
        .filter(t => templateCategory === 'All Templates' || t.category === templateCategory)
        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isBuilding) {
        return <CampaignBuilder onClose={handleBuilderClose} initialData={editingCampaign} />;
    }

    return (
        <div className="relative flex flex-col h-[calc(100vh-2rem)] lg:h-full w-full min-h-0 max-w-full overflow-x-hidden px-1 sm:px-2 pb-2">

            {/* Header & Tabs */}
            <div className="flex flex-col gap-5 shrink-0 mb-6 mt-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-[28px] md:text-[32px] font-extrabold text-text-dark leading-[1.1] mb-1.5 tracking-tight ${serif.className}`}>Outreach</h1>
                        <p className="text-[14px] font-medium text-muted">Manage your email campaigns and outreach templates.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {activeTab === 'Templates' ? (
                            <button
                                onClick={openNewTemplate}
                                className="flex items-center gap-2 px-4 py-2 bg-primary shadow-sm rounded-lg text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                                <FiPlus size={14} /> New Template
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsBuilding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] shadow-sm rounded-lg text-[13px] font-semibold text-white hover:bg-black transition-colors cursor-pointer"
                            >
                                <FiPlus size={15} /> New Campaign
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-6 border-b border-border/60">
                    {['Campaigns', 'Templates'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                            className={`pb-3 text-[14px] font-bold transition-colors relative cursor-pointer ${activeTab === tab ? 'text-primary' : 'text-muted hover:text-text-dark'}`}
                        >
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <section className="flex-1 flex flex-col min-h-0 border border-border/60 bg-background shadow-sm rounded-xl max-w-full overflow-hidden">

                {/* Search & Filters */}
                <div className="w-full p-3 border-b border-border/40 flex flex-col sm:flex-row items-center gap-3 shrink-0 bg-background">
                    <div className="relative flex-1 w-full">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                        <input
                            type="text"
                            placeholder={activeTab === 'Campaigns' ? "Search campaigns..." : "Search templates..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-border/60 rounded-lg text-[13px] font-medium placeholder:text-muted outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-background transition-all"
                        />
                    </div>

                    {activeTab === 'Campaigns' && (
                        <div className="flex items-center bg-surface/60 p-1 rounded-lg border border-border/40 overflow-x-auto scrollbar-hide shrink-0">
                            {['All', 'Draft', 'Running', 'Scheduled', 'Completed', 'Failed'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setStatusFilter(option)}
                                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${statusFilter === option ? 'bg-background text-text-dark shadow-sm border border-border/50' : 'text-muted hover:text-text-dark hover:bg-black/5 border border-transparent'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Templates' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                            <div className="flex items-center bg-surface/60 p-1 rounded-lg border border-border/40 shrink-0">
                                {['All Templates', 'Cold Outreach', 'Follow-up', 'Newsletter', 'Transactional', 'Event Invite'].map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setTemplateCategory(option)}
                                        className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${templateCategory === option ? 'bg-background text-primary shadow-sm border border-border/50' : 'text-muted hover:text-text-dark hover:bg-black/5 border border-transparent'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <button className="p-2 border border-border/60 rounded-lg bg-surface/50 hover:bg-surface text-muted hover:text-text-dark transition-colors cursor-pointer shrink-0">
                                <FiFilter size={15} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-surface/10">
                    {activeTab === 'Campaigns' ? (
                        campaignsLoading ? <Spinner /> :
                        filteredCampaigns.length === 0 ? (
                            <EmptyState label="No campaigns yet." onAction={() => setIsBuilding(true)} actionLabel="+ New Campaign" />
                        ) : (
                            <div className="w-full min-w-[800px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60">Campaign Name</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60">Status</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60">Created</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60 text-right">Recipients</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60 text-center">Progress</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border/60 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 bg-background">
                                        {filteredCampaigns.map((campaign) => {
                                            const progress = campaign.totalRecipients > 0
                                                ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
                                                : 0;
                                            return (
                                                <tr key={campaign._id} className="group hover:bg-surface/50 transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <p className="text-[14px] font-bold text-text-dark">{campaign.name}</p>
                                                        <p className="text-[12px] text-muted font-medium mt-0.5">Updated {timeAgo(campaign.updatedAt)}</p>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[11px] font-bold ${statusStyles[campaign.status] || statusStyles['Draft']}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[campaign.status] || 'bg-gray-500'}`} />
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-[13px] font-medium text-text-dark">{formatDate(campaign.createdAt)}</td>
                                                    <td className="px-4 py-3.5 text-[13px] font-bold text-text-dark text-right">{campaign.totalRecipients}</td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-24 h-2 bg-surface border border-border/50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                                            </div>
                                                            <span className="text-[12px] font-bold text-muted w-8">{progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {campaign.status === 'Draft' && (
                                                                <button
                                                                    onClick={() => handleLaunchCampaign(campaign._id)}
                                                                    disabled={sendingId === campaign._id}
                                                                    className={`p-1.5 border rounded-md transition-all cursor-pointer ${sendingId === campaign._id ? 'text-green-600 bg-green-50 border-green-200 cursor-wait' : 'text-muted hover:text-green-600 hover:bg-green-50 border-transparent hover:border-green-200'}`}
                                                                    title={sendingId === campaign._id ? 'Sending…' : 'Launch'}
                                                                >
                                                                    {sendingId === campaign._id
                                                                        ? <FiLoader size={14} className="animate-spin" />
                                                                        : <FiPlay size={14} />}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { setEditingCampaign(campaign); setIsBuilding(true); }}
                                                                className="p-1.5 text-muted hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 rounded-md transition-all cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDuplicateCampaign(campaign)}
                                                                className="p-1.5 text-muted hover:text-text-dark hover:bg-surface border border-transparent hover:border-border rounded-md transition-all cursor-pointer"
                                                                title="Duplicate"
                                                            >
                                                                <FiCopy size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCampaign(campaign._id)}
                                                                className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-all cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        templatesLoading ? <Spinner /> :
                        filteredTemplates.length === 0 ? (
                            <EmptyState label="No templates yet." onAction={openNewTemplate} actionLabel="+ New Template" />
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTemplates.map((template, idx) => (
                                    <div key={template._id} className="bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                        {/* Thumbnail */}
                                        <div className={`h-40 w-full ${CARD_COLORS[idx % CARD_COLORS.length]} relative overflow-hidden flex items-center justify-center p-4`}>
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-text-dark shadow-sm">
                                                {template.category}
                                            </div>
                                            <div className="w-24 h-32 bg-white rounded shadow-sm opacity-50 transform rotate-[-5deg]" />
                                            <div className="w-24 h-32 bg-white rounded shadow-sm absolute opacity-70" />
                                        </div>

                                        <div className="p-4 flex flex-col gap-3 flex-1">
                                            <h3 className="text-[15px] font-bold text-text-dark">{template.name}</h3>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => openEditTemplate(template)}
                                                    className="flex-1 py-1.5 bg-primary text-white rounded-md text-[13px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicateTemplate(template)}
                                                    className="p-1.5 bg-background border border-border text-muted rounded-md hover:bg-surface hover:text-text-dark transition-colors cursor-pointer"
                                                    title="Duplicate"
                                                >
                                                    <FiCopy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template._id)}
                                                    className="p-1.5 bg-background border border-border text-muted rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </section>

            {isTemplateModalOpen && (
                <TemplateEditorModal
                    onClose={() => { setIsTemplateModalOpen(false); setEditingTemplate(null); }}
                    onSave={handleSaveTemplate}
                    initialData={editingTemplate}
                />
            )}
        </div>
    );
};

export default Outreach;