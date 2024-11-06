/**
 * @file useVyFood.tsx
 * @description Vy Food hook.
 */

'use strict';

import type { Product } from '@sources/ts/types/VyFood';
import {
    FunctionComponent,
    ReactNode,
    createContext,
    useState,
    useContext,
} from 'react';
import PropTypes from 'prop-types';

import { useLocalStorage } from '@sources/ts/hooks/useLocalStorage';
import apis from '@sources/ts/apis';
import staticUrls from '@sources/ts/render/static-urls';

type VyFoodHook = {
    productItems: Product[];
    setProductItems: React.Dispatch<React.SetStateAction<Product[]>>;
    handleRefreshProduct: () => Promise<Product[]>;
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

    const handleRefreshProduct = async () => {
        const { message, success, data } = await apis.backend.getProducts();
        if (!success) {
            console.error(message);
            setProductItems(null);
            setIsBackendUnavailable(true);
            return null;
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
        return products;
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
