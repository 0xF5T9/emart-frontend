/**
 * @file useVyFood.tsx
 * @description Vy Food hook.
 */

'use strict';

import type { Product, CartItem } from '@sources/ts/types/VyFood';
import {
    FunctionComponent,
    ReactNode,
    createContext,
    useState,
    useContext,
    useEffect
} from 'react';
import PropTypes from 'prop-types';

import { useLocalStorage } from '@sources/ts/hooks/useLocalStorage';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';

type VyFoodHook = {
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

// Vy Food context.
const vyFoodContext = createContext(null);

/**
 * Vy Food context provider component.
 * @param props Component properties.
 * @param props.children Context children.
 * @returns Returns the component.
 */
const VyFoodProvider: FunctionComponent<{ children: ReactNode }> = function ({
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
        const { message, success, data } = await apis.backend.getProducts();
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
                            `Sản phẩm <b style="color: var(--color-primary, blue)">${cartItem.product.name}</b> không còn tồn tại nữa.<br/>(Sản phẩm đã bị xoá khỏi giỏ hàng của bạn)`
                        );
                        return null;
                    }
                    if (
                        cartItem?.product?.price !==
                        mappedProducts[cartItem?.product?.slug]?.price
                    ) {
                        newCartMessages.push(
                            `Giá của sản phẩm <b style="color: var(--color-primary, blue)">${cartItem.product.name}</b> đã được thay đổi từ <b style="color: var(--color-primary, blue)">${window.myHelper.convertVNDNumberToString(cartItem?.product?.price)}</b> thành <b style="color: var(--color-primary, blue)">${window.myHelper.convertVNDNumberToString(mappedProducts[cartItem?.product?.slug]?.price)}</b>.<br/>(Giỏ hàng của bạn đã được cập nhật)`
                        );
                        cartItem.product.price =
                            mappedProducts[cartItem?.product?.slug]?.price;
                    }

                    if (
                        mappedProducts[cartItem?.product?.slug].quantity === 0
                    ) {
                        newCartMessages.push(
                            `Sản phẩm <b style="color: var(--color-primary, blue)">${cartItem.product.name}</b> đã hết hàng.<br/>(Giỏ hàng của bạn đã được cập nhật)`
                        );
                        return null;
                    }
                    const newQuantity =
                        mappedProducts[cartItem?.product?.slug].quantity -
                        cartItem.totalItems;
                    if (newQuantity < 0) {
                        newCartMessages.push(
                            `Cửa hàng chỉ còn ${mappedProducts[cartItem?.product?.slug].quantity} sản phẩm <b style="color: var(--color-primary, blue)">${cartItem.product.name}</b>.<br/>(Giỏ hàng của bạn đã được cập nhật)`
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

    const value: VyFoodHook = {
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
        document.addEventListener("visibilitychange", () => {
            const cartItemsInLocalStorage = JSON.parse(window.localStorage.getItem('cartItems'));
            setCartItems(cartItemsInLocalStorage);
        });
    }, [])

    return (
        <vyFoodContext.Provider value={value}>
            {children}
        </vyFoodContext.Provider>
    );
};

VyFoodProvider.propTypes = {
    children: PropTypes.node,
};

/**
 * Hook that access Vy Food global states.
 * @returns productItems, setProductItems, productFilter, setProductFilter, productSearchValue, setProductSearchValue
 */
function useVyFood(): VyFoodHook {
    return useContext(vyFoodContext);
}

export { vyFoodContext, VyFoodProvider, useVyFood };
