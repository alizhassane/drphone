export interface Product {
    id?: number;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    category: string;
}
export declare const getAllProducts: () => Promise<any[] | never[]>;
export declare const createProduct: (product: Product) => Promise<any>;
export declare const updateStock: (id: number, quantityChange: number) => Promise<any>;
export declare const searchProducts: (searchQuery: string) => Promise<any[] | never[]>;
//# sourceMappingURL=productService.d.ts.map