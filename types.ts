export interface ProductData {
    position: number;
    name: string | null | undefined;
    url: string | null | undefined;
    photo: string | null | undefined;
    price: string | null | undefined;
    stars: string | null | undefined;
    reviews: string | null | undefined;
    prices?: { type: string, price: string }[];
    sold?: string;
}

export interface ExcelData extends ProductData {
    photo_display: string;
    category: string;
    source: string;
}

export interface Category {
    name: string;
    label: string;
}

export type ScrapperFn = (category: string) => Promise<ProductData[]>