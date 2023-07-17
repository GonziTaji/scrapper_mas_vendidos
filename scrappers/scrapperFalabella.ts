import { JSDOM } from 'jsdom';
import { getDigits } from '../lib';
import { ProductData } from '../types';

export default async function scrapperFalabella(category: string): Promise<ProductData[]> {
    const url = `https://www.falabella.com/falabella-cl/category/${category}?sortBy=product.averageOverallRating%2Cdesc`;

    const dom = await JSDOM.fromURL(url);

    const document = dom.window.document;

    const el = document.getElementById('__NEXT_DATA__');


    if (!el) {
        throw 'No NEXT DATA element found!'
    }

    const data: FalabellaNextData = JSON.parse(el.innerHTML);

    return data.props.pageProps.results.map((product, i) => ({
        position: i+1,
        name: product.displayName,
        url: product.url,
        photo: product.mediaUrls[0],
        price: getDigits(product.prices[0].price[0]),
        prices: product.prices.map(price => ({ type: price.type, price: price.price[0] })),
        reviews: product.totalReviews || '0',
        stars: product.rating || 'none'
    }));
}

export interface FalabellaNextData {
    props: {
        pageProps: {
            results: FalabellaProductData[];
        }
    }
}

export interface FalabellaProductData {
    productId: string;
    skuId: string;
    topSpecifications: any[],
    merchantCategoryId: string;
    displayName: string;
    productType: string;
    viewTemplate: string;
    url: string;
    brand: string;
    media: {
        id: string;
        type: string;
        onImageHover: string;
    },
    mediaUrls: string[],
    badges: any[],
    multipurposeBadges: any[],
    meatStickers: any[],
    prices: {
        label: string;
        icons: string;
        symbol: string;
        type: string;
        crossed: false,
        price: string[]
    }[],
    totalReviews?: string;
    rating?: string;
    availability: {
        homeDeliveryShipping: string;
        pickUpFromStoreShipping: string;
        internationalShipping: string;
        primeShipping: string;
    },
    variants: {
        type: string;
        options: any[]
    }[],
    sellerId: string;
    sellerName: string;
    offeringId: string;
    isBestSeller: false,
    isSponsored: true,
    mabaya_ad_info: string;
    GSCCategoryId: string;
    onlyBuyAtStore: false
}