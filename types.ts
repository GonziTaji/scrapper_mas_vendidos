export interface ProductData {
    position: number;
    name: string | null | undefined;
    url: string | null | undefined;
    photo: string | null | undefined;
    price: string | number | null | undefined;
    stars: string | null | undefined;
    reviews: string | null | undefined;
    prices?: { type: string, price: string }[];
    sold?: string;
    category: string;
    source: string;
}

export interface ExcelData extends ProductData {
    photo_display: string;
    category: string;
    source: string;
}

export interface AliexpressCategories {
    grandparent_name: string;
    grandparent_url: string;
    parent_name: string;
    parent_url: string;
    category_name: string;
    category_url: string;
}

export interface Category {
    name: string;
    label: string;
}

export type ScrapperFn = (category: string) => Promise<ProductData[]>