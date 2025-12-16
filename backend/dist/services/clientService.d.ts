export interface Client {
    id?: number;
    name: string;
    phone: string;
    email: string;
}
export declare const getAllClients: () => Promise<any[] | never[]>;
export declare const createClient: (client: Client) => Promise<any>;
export declare const searchClients: (searchQuery: string) => Promise<any[] | never[]>;
//# sourceMappingURL=clientService.d.ts.map