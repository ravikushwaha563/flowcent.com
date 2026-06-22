// Plan limits and feature gating utility for Flowcent SaaS billing

export type PlanType = 'free' | 'pro' | 'agency';

export interface PlanLimits {
    maxInvoices: number | null;
    maxClients: number | null;
    maxAiAnalyses: number | null;
    autoFollowups: boolean;
    csvExport: boolean;
    advancedAnalytics: boolean;
    label: string;
    price: number;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    free: {
        maxInvoices: 5,
        maxClients: 3,
        maxAiAnalyses: 5,
        autoFollowups: false,
        csvExport: false,
        advancedAnalytics: false,
        label: 'Free',
        price: 0,
    },
    pro: {
        maxInvoices: null,
        maxClients: null,
        maxAiAnalyses: null,
        autoFollowups: true,
        csvExport: true,
        advancedAnalytics: true,
        label: 'Pro',
        price: 499,
    },
    agency: {
        maxInvoices: null,
        maxClients: null,
        maxAiAnalyses: null,
        autoFollowups: true,
        csvExport: true,
        advancedAnalytics: true,
        label: 'Agency',
        price: 1499,
    },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export interface UsageCheck {
    allowed: boolean;
    message: string;
    currentUsage: number;
    limit: number | null;
    upgradeRequired: boolean;
}

export function checkInvoiceLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = limits.maxInvoices === null || currentCount < limits.maxInvoices;
    return {
        allowed,
        message: allowed ? '' : `Your plan allows ${limits.maxInvoices} invoices/month. Upgrade for unlimited invoices.`,
        currentUsage: currentCount,
        limit: limits.maxInvoices,
        upgradeRequired: !allowed,
    };
}

export function checkClientLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = limits.maxClients === null || currentCount < limits.maxClients;
    return {
        allowed,
        message: allowed ? '' : `Your plan allows ${limits.maxClients} clients. Upgrade for unlimited clients.`,
        currentUsage: currentCount,
        limit: limits.maxClients,
        upgradeRequired: !allowed,
    };
}

export function checkAiLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = limits.maxAiAnalyses === null || currentCount < limits.maxAiAnalyses;
    return {
        allowed,
        message: allowed ? '' : `Your plan allows ${limits.maxAiAnalyses} AI analyses/month. Upgrade for unlimited AI.`,
        currentUsage: currentCount,
        limit: limits.maxAiAnalyses,
        upgradeRequired: !allowed,
    };
}

export function checkAutoFollowup(plan: PlanType): { allowed: boolean; message: string } {
    const limits = getPlanLimits(plan);
    return {
        allowed: limits.autoFollowups,
        message: limits.autoFollowups ? '' : 'Automated follow-ups are a Pro feature. Upgrade to enable.',
    };
}
