export interface Client {
    id?: number;
    name: string;
    phone: string;
    email: string;
}
export declare const getAllClients: () => Promise<any[]>;
export declare const createClient: (client: Client) => Promise<any>;
export declare const searchClients: (query: string) => Promise<any[]>;
//# sourceMappingURL=clientService.d.ts.map