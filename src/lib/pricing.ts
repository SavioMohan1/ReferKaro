export interface TokenPlan {
    readonly id: string;
    readonly name: string;
    readonly tokens: number;
    readonly price: number;
    readonly currency: string;
    readonly description: string;
    readonly popular: boolean;
}

export const TOKEN_PLANS = [
    {
        id: 'starter',
        name: 'Starter Pack',
        tokens: 3,
        price: 99,
        currency: 'INR',
        description: 'Perfect for trying out the platform.',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        tokens: 10,
        price: 299,
        currency: 'INR',
        description: 'Best value for serious job seekers.',
        popular: true,
    },
] as const;

export type PlanId = typeof TOKEN_PLANS[number]['id'];

export function getPlanById(planId: string) {
    return TOKEN_PLANS.find(p => p.id === planId);
}
