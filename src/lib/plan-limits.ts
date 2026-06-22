// Plan limits and feature gating utility for Flowcent SaaS billing

export type PlanType = 'free' | 'pro' | 'agency';

export interface PlanLimits {
    maxInvoices: number;
    maxClients: number;
    maxAiAnalyses: number;
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
        maxInvoices: Infinity,
        maxClients: Infinity,
        maxAiAnalyses: Infinity,
        autoFollowups: true,
        csvExport: true,
        advancedAnalytics: true,
        label: 'Pro',
        price: 499,
    },
    agency: {
        maxInvoices: Infinity,
        maxClients: Infinity,
        maxAiAnalyses: Infinity,
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
    limit: number;
    upgradeRequired: boolean;
}

export function checkInvoiceLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = currentCount < limits.maxInvoices;
    return {
        allowed,
        message: allowed ? '' : `Free plan allows ${limits.maxInvoices} invoices/month. Upgrade to Pro for unlimited invoices.`,
        currentUsage: currentCount,
        limit: limits.maxInvoices,
        upgradeRequired: !allowed,
    };
}

export function checkClientLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = currentCount < limits.maxClients;
    return {
        allowed,
        message: allowed ? '' : `Free plan allows ${limits.maxClients} clients. Upgrade to Pro for unlimited clients.`,
        currentUsage: currentCount,
        limit: limits.maxClients,
        upgradeRequired: !allowed,
    };
}

export function checkAiLimit(plan: PlanType, currentCount: number): UsageCheck {
    const limits = getPlanLimits(plan);
    const allowed = currentCount < limits.maxAiAnalyses;
    return {
        allowed,
        message: allowed ? '' : `Free plan allows ${limits.maxAiAnalyses} AI analyses/month. Upgrade to Pro for unlimited AI.`,
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
