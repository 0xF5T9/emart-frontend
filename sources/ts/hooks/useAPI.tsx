/**
 * @file useAPI.tsx
 * @description API hook.
 */

'use strict';

import type { Product, CartItem } from '@sources/ts/apis/emart/types';
import {
    FunctionComponent,
    ReactNode,
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { useLocalStorage } from '@sources/ts/hooks/useLocalStorage';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';

type APIHook = {
    productItems: Product[];
    setProductItems: React.Dispatch<React.SetStateAction<Product[]>>;
    handleRefreshProduct: (refreshCart: boolean) => Promise<void>;
    productFilter:
        | {
              type: 'name';
              value: string;
          }
        | {
              type: 'category';
              value: string;
          };
    setProductFilter: React.Dispatch<
        React.SetStateAction<
            | {
                  type: 'name';
                  value: string;
              }
            | {
                  type: 'category';
                  value: string;
              }
        >
    >;
    productSearchValue: string;
    setProductSearchValue: React.Dispatch<React.SetStateAction<string>>;
    isBackendUnavailable: boolean;
    cartItems: string;
    setCartItems: (stringifiedCartItems: string) => void;
};

// API context.
const apiContext = createContext(null);

/**
 * API context provider component.
 * @param props Component properties.
 * @param props.children Context children.
 * @returns Returns the component.
 */
const APIProvider: FunctionComponent<{ children: ReactNode }> = function ({
    children,
}) {
    const [productItems, setProductItems] = useState<Product[] | null>(null);

    const [productFilter, setProductFilter] = useState<
            | {
                  type: 'name';
                  value: string;
              }
            | {
                  type: 'category';
                  value: string;
              }
        >(null),
        [productSearchValue, setProductSearchValue] = useState('');

    const [isBackendUnavailable, setIsBackendUnavailable] = useState(false);

    const [cartItems, setCartItems] = useLocalStorage('cartItems', '[]') as [
        cartItems: string,
        setCartItems: (stringifiedCartItems: string) => void,
    ];

    const handleRefreshProduct = async (refreshCart = false) => {
        const { message, success, data } = await apis.emart.getProducts();
        if (!success) {
            console.error(message);
            setProductItems(null);
            setIsBackendUnavailable(true);
            return;
        }

        const rawProducts = data?.products,
            products: Product[] = rawProducts?.map((uProduct) => {
                const product: Product = {
                    ...uProduct,
                    imageFileName: uProduct.imageFileName
                        ? `${process.env.UPLOAD_URL}/product/${uProduct.imageFileName}`
                        : staticUrls.imagePlaceholder,
                    priority: uProduct.priority,
                };
                return product;
            });
        setProductItems(products);

        if (!refreshCart) return;

        const mappedProducts: any = products?.reduce((acc: any, product) => {
            acc[product?.slug] = { ...product };
            return acc;
        }, {});

        const newCartMessages: string[] = [],
            parsedCartItems: CartItem[] = JSON.parse(cartItems) || [],
            newCartItems = parsedCartItems
                ?.map((cartItem) => {
                    if (!mappedProducts[cartItem?.product?.slug]) {
                        newCartMessages.push(
                            `${staticTexts.hooks.useAPI.productNoLongerExist1}<b style="color: var(--color-primary, blue)">${cartItem.product.name}</b>${staticTexts.hooks.useAPI.productNoLongerExist2}<br/>${staticTexts.hooks.useAPI.productNoLongerExist3}`
                        );
                        return null;
                    }
                    if (
                        cartItem?.product?.price !==
                        mappedProducts[cartItem?.product?.slug]?.price
                    ) {
                        newCartMessages.push(
                            `${staticTexts.hooks.useAPI.productPriceChanged1}<b style="color: var(--color-primary, blue)">${cartItem.product.name}</b>${staticTexts.hooks.useAPI.productPriceChanged2}<b style="color: var(--color-primary, blue)">${window.myHelper.convertUSDNumberToString(cartItem?.product?.price)}</b>${staticTexts.hooks.useAPI.productPriceChanged3}<b style="color: var(--color-primary, blue)">${window.myHelper.convertUSDNumberToString(mappedProducts[cartItem?.product?.slug]?.price)}</b>${staticTexts.hooks.useAPI.productPriceChanged4}<br/>${staticTexts.hooks.useAPI.productPriceChanged5}`
                        );
                        cartItem.product.price =
                            mappedProducts[cartItem?.product?.slug]?.price;
                    }

                    if (
                        mappedProducts[cartItem?.product?.slug].quantity === 0
                    ) {
                        newCartMessages.push(
                            `${staticTexts.hooks.useAPI.productOutOfStock1}<b style="color: var(--color-primary, blue)">${cartItem.product.name}</b>${staticTexts.hooks.useAPI.productOutOfStock2}<br/>${staticTexts.hooks.useAPI.productOutOfStock3}`
                        );
                        return null;
                    }
                    const newQuantity =
                        mappedProducts[cartItem?.product?.slug].quantity -
                        cartItem.totalItems;
                    if (newQuantity < 0) {
                        newCartMessages.push(
                            `${staticTexts.hooks.useAPI.productQuantityChanged1}<b style="color: var(--color-primary, blue)">${mappedProducts[cartItem?.product?.slug].quantity} ${cartItem.product.name}</b>${staticTexts.hooks.useAPI.productQuantityChanged2}<br/>${staticTexts.hooks.useAPI.productQuantityChanged3}`
                        );
                        cartItem.totalItems =
                            mappedProducts[cartItem?.product?.slug].quantity;
                        return cartItem;
                    }
                    mappedProducts[cartItem?.product?.slug].quantity =
                        newQuantity;
                    return cartItem;
                })
                .filter((cartItem) => !!cartItem);
        if (!newCartItems?.length) setCartItems(JSON.stringify([]));
        else setCartItems(JSON.stringify(newCartItems));
        if (newCartMessages?.length)
            newCartMessages.forEach((message) =>
                showToast({
                    variant: 'primary',
                    title: staticTexts.paymentWindow.cartItemsUpdatedToast
                        .title,
                    message: message,
                    duration: 10000,
                })
            );
        return;
    };

    const value: APIHook = {
        productItems,
        setProductItems,
        handleRefreshProduct,
        productFilter,
        setProductFilter,
        productSearchValue,
        setProductSearchValue,
        isBackendUnavailable,
        cartItems,
        setCartItems,
    };

    useEffect(() => {
        document.addEventListener('visibilitychange', () => {
            const cartItemsInLocalStorage = JSON.parse(
                window.localStorage.getItem('cartItems')
            );
            setCartItems(cartItemsInLocalStorage);
        });
    }, []);

    return <apiContext.Provider value={value}>{children}</apiContext.Provider>;
};

APIProvider.propTypes = {
    children: PropTypes.node,
};

/**
 * Hook that access API states.
 * @returns productItems, setProductItems, productFilter, setProductFilter, productSearchValue, setProductSearchValue
 */
function useAPI(): APIHook {
    return useContext(apiContext);
}

export { apiContext, APIProvider, useAPI };
