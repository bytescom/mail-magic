import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function replaceVariables(template, variables) {
    let result = template;

    // Create a comprehensive map of variables including common aliases
    const allVariables = { ...variables };

    // Common aliases for better UX
    if (variables.hr_name) allVariables.name = variables.hr_name;
    if (variables.company) allVariables.company_name = variables.company;
    if (variables.job_role) allVariables.role = variables.job_role;

    Object.keys(allVariables).forEach((key) => {
        // Create case-insensitive regex for the placeholder
        const regex = new RegExp(`{{${key}}}`, 'gi');

        // Use an empty string if value is null/undefined to clear the placeholder
        const value = allVariables[key] !== undefined && allVariables[key] !== null
            ? String(allVariables[key])
            : "";

        result = result.replace(regex, value);
    });

    return result;
}

export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str, length = 50) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getStatusColor(status) {
    const colors = {
        sent: 'text-green-500',
        failed: 'text-red-500',
        pending: 'text-yellow-500',
        queued: 'text-blue-500',
    };
    return colors[status] || 'text-gray-500';
}

export function getStatusBadgeClass(status) {
    const classes = {
        sent: 'bg-green-500/10 text-green-500 border-green-500/20',
        failed: 'bg-red-500/10 text-red-500 border-red-500/20',
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        queued: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return classes[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}
