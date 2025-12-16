export interface Repair {
    id?: number;
    client_id: number;
    device_details: string;
    issue_description: string;
    status: string;
    cost_estimate: number;
}
export declare const getAllRepairs: () => Promise<any[]>;
export declare const createRepair: (repair: Repair) => Promise<any>;
export declare const updateRepairStatus: (id: number, status: string) => Promise<any>;
//# sourceMappingURL=repairService.d.ts.map