import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Raffle {
    id: bigint;
    drawTimestamp: Time;
    status: RaffleStatus;
    title: string;
    lastUpdated: Time;
    winner?: string;
    description: string;
    createdTime: Time;
    drawRecordId?: string;
    totalSpots: bigint;
    spotPriceCents: bigint;
    prizeAmountCents: bigint;
    videoUrl?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Entry {
    id: bigint;
    raffleId: bigint;
    purchaseTime: Time;
    isPaid: boolean;
    quantity: bigint;
    buyer: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface RaffleAdminConfig {
    drawTimestamp: Time;
    title: string;
    description: string;
    totalSpots: bigint;
    spotPriceCents: bigint;
    prizeAmountCents: bigint;
    videoUrl?: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
}
export enum RaffleStatus {
    closed = "closed",
    upcoming = "upcoming",
    open = "open",
    drawn = "drawn"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeStatus(id: bigint, newStatus: RaffleStatus): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createRaffle(config: RaffleAdminConfig): Promise<bigint>;
    getActiveRaffles(): Promise<Array<Raffle>>;
    getAllRaffles(): Promise<Array<Raffle>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedRaffles(): Promise<Array<{
        id: bigint;
        drawTimestamp: Time;
        title: string;
        participants: bigint;
        winner?: string;
        spotsSold: bigint;
    }>>;
    getEntries(raffleId: bigint): Promise<Array<Entry>>;
    getLiveRaffle(id: bigint): Promise<{
        timeToDraw: bigint;
        entries: Array<Entry>;
        raffle: Raffle;
    }>;
    getRemainingSpots(raffleId: bigint): Promise<bigint>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    purchaseEntries(buyerPid: string, raffleId: bigint, quantity: bigint, _quantityConfirmed: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    triggerDraw(id: bigint): Promise<void>;
    updateRaffle(id: bigint, config: RaffleAdminConfig): Promise<void>;
}
