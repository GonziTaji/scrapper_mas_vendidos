export interface ProductData {
    name: string | null | undefined,
    url: string | null | undefined,
    photo: string | null | undefined,
    price: string | null | undefined,
    stars: string | null | undefined,
    reviews: string | null | undefined,
    prices?: { type: string, price: string }[] // falabella price data
}

export interface Category {
    name: string;
    label: string;
}

export type ScrapperFn = (category: string) => Promise<ProductData[]>