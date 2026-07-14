"use client";
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import TrackingStats from './TrackingStats';
import TrackingTable from './TrackingTable';
import TrackingDrawer from './drawer/TrackingDrawer';
import { fetchApplications, setFilter } from '../trackingSlice';
import { useScrollLock } from "@/lib/useScrollLock";


const tabDisplayNames = ["ALL", "SENT", "FOLLOW-UP SENT", "REPLIED", "INTERVIEW", "REJECTED", "CLOSED"];

export default function TrackingPage() {
    const dispatch = useDispatch();
    const { applications, metrics, currentFilters, loading, isDrawerOpen, pagination } = useSelector((state) => state.tracking);
    useScrollLock(isDrawerOpen);

    useEffect(() => {
        dispatch(fetchApplications({
            tab: currentFilters.tab,
            search: currentFilters.search,
            page: pagination.currentPage,
            limit: pagination.itemsPerPage
        }));
    }, [dispatch, currentFilters.tab, currentFilters.search, pagination.currentPage, pagination.itemsPerPage]);

    const handleSearch = (e) => {
        // Simple debounce could be added here
        dispatch(setFilter({ search: e.target.value }));
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden relative">
            {/* Drawer Overlay */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => dispatch({ type: 'tracking/closeDrawer' })}
                />
            )}
            <TrackingDrawer />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold text-primary tracking-[0.1em] uppercase mb-1.5">Tracking</p>
                    <h1 className={`text-[32px] md:text-[36px] font-bold text-text-dark leading-[1.1] mb-1 tracking-tight`}>Applications</h1>
                    <p className="text-[15px] font-medium text-text">Track every application, reply, and follow-up in one place.</p>
                </div>
                <button 
                    onClick={() => dispatch(fetchApplications({ tab: currentFilters.tab, search: currentFilters.search, page: 1, limit: pagination.itemsPerPage }))}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary shadow-md shadow-primary/20 rounded-lg text-[13px] font-bold text-white hover:opacity-90 transition-colors shrink-0 w-fit cursor-pointer"
                >
                    <FiRefreshCw size={15} className={loading.list ? 'animate-spin' : ''} /> Check Replies
                </button>
            </div>

            {/* Metric Cards */}
            <TrackingStats metrics={metrics} />

            {/* Main Section */}
            <section className="border border-border bg-background shadow-sm rounded-xl overflow-hidden mt-6 mb-8 w-full max-w-full relative z-10">

                {/* Tabs */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="bg-surface border border-border rounded-lg flex overflow-x-auto max-w-full">
                        {tabDisplayNames.map(tab => (
                            <button
                                key={tab}
                                onClick={() => dispatch(setFilter({ tab }))}
                                className={`px-6 py-2 text-[13px] font-medium transition-all whitespace-nowrap sm:flex-1 text-center cursor-pointer ${currentFilters.tab === tab
                                        ? 'bg-background text-text-dark border-t-[3px] border-t-primary shadow-[0_-1px_0_0_theme(colors.gray.100)]'
                                        : 'text-muted hover:text-primary hover:bg-surface border-t-[3px] border-t-transparent'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-border">
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            value={currentFilters.search}
                            onChange={handleSearch}
                            placeholder="Search company, role, HR email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-[14px] font-medium placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background transition-all"
                        />
                    </div>
                </div>

                <TrackingTable applications={applications} loading={loading.list} />

                {/* Footer Pagination */}
                <div className="px-5 py-3 border-t border-border bg-surface rounded-b-xl flex items-center justify-between">
                    <p className="text-[12px] font-medium text-muted">
                        Showing {applications.length} of {pagination.totalItems} applications
                    </p>
                    {/* Basic Pagination Controls */}
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.currentPage === 1}
                            onClick={() => dispatch({ type: 'tracking/setPage', payload: pagination.currentPage - 1 })}
                            className="px-3 py-1.5 text-[12px] font-bold border border-border rounded bg-background hover:bg-surface disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button 
                            disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => dispatch({ type: 'tracking/setPage', payload: pagination.currentPage + 1 })}
                            className="px-3 py-1.5 text-[12px] font-bold border border-border rounded bg-background hover:bg-surface disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
