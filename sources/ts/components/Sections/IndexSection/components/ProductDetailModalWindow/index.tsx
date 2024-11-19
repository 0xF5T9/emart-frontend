/**
 * @file index.tsx
 * @description Product detail modal window.
 */

'use strict';
import type { Product, CartItem } from '@sources/ts/types/VyFood';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useVyFood } from '@sources/ts/hooks/useVyFood';
import { useModal } from '@sources/ts/hooks/useModal';
import CartModalWindow, {
    cartModalWindowStyles,
} from '@sources/ts/components/Header/components/CartModalWindow';
import * as styles from './ProductDetailModalWindow.module.css';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.productsView.productDetailWindow;

/**
 * Product detail modal window.
 * @param props Component properties.
 * @param props.productItem Product item.
 * @returns Returns the component.
 */
const ProductDetailModalWindow: FunctionComponent<{ productItem: Product }> = ({
    productItem,
}) => {
    const { cartItems, setCartItems } = useVyFood();

    const { setModal, setModalVisibility } = useModal();
    const modalWindow = useRef<HTMLDivElement>(),
        noteboxInput = useRef<HTMLTextAreaElement>();

    const [amount, setAmount] = useState(1),
        [total, setTotal] = useState<number>(null);

    function handleOrderNow() {
        const parsedCartItems: CartItem[] = JSON.parse(cartItems);
        const highestCartItemId = parsedCartItems.reduce(
            (maxId, currentCartItem) => Math.max(maxId, currentCartItem.id),
            0
        );
        parsedCartItems.push({
            id: highestCartItemId ? highestCartItemId + 1 : 1,
            product: productItem,
            totalItems: amount,
            note: noteboxInput?.current?.value || '',
        });
        setCartItems(JSON.stringify(parsedCartItems));
        // setModalVisibility(false);
        setModal({
            type: 'custom',
            className: cartModalWindowStyles['modal-window-wrapper'],
            content: <CartModalWindow />,
        });
    }

    function handleAddToCart() {
        const parsedCartItems: CartItem[] = JSON.parse(cartItems);
        const highestCartItemId = parsedCartItems.reduce(
            (maxId, currentCartItem) => Math.max(maxId, currentCartItem.id),
            0
        );
        parsedCartItems.push({
            id: highestCartItemId ? highestCartItemId + 1 : 1,
            product: productItem,
            totalItems: amount,
            note: noteboxInput?.current?.value || '',
        });
        setCartItems(JSON.stringify(parsedCartItems));
        setModalVisibility(false);
    }

    useEffect(() => {
        if (productItem?.price) setTotal(productItem?.price * amount);
    }, [amount]);

    return (
        <div ref={modalWindow} className={styles['modal-window']}>
            <div className={styles['content-main']}>
                <div className={styles['product-image-wrapper']}>
                    <img
                        className={styles['product-image']}
                        src={
                            productItem.imageFileName ||
                            staticUrls.imagePlaceholder
                        }
                        alt={`${texts.productImageAlt} ${productItem.name}`}
                        onError={(event) => {
                            event.currentTarget.src =
                                staticUrls.imagePlaceholder;
                        }}
                    />
                </div>
                <div className={styles['product-content']}>
                    <span className={styles['product-name']}>
                        {productItem.name}
                    </span>
                    <div className={styles['product-price-wrapper']}>
                        <span className={styles['product-price']}>
                            {window.myHelper.convertVNDNumberToString(
                                productItem.price
                            )}
                        </span>
                        <div className={styles['amount-inputs-wrapper']}>
                            <button
                                className={styles['input-minus']}
                                onClick={() =>
                                    setAmount((prevAmount) => {
                                        let newAmount = prevAmount - 1;
                                        if (newAmount < 1) newAmount = 1;
                                        return newAmount;
                                    })
                                }
                            >
                                -
                            </button>
                            <input
                                className={styles['input-amount']}
                                type="number"
                                value={amount}
                                onChange={(event) => {
                                    let value = parseFloat(
                                        event.currentTarget.value
                                    );
                                    value =
                                        Number.isNaN(value) || value < 1
                                            ? 1
                                            : value > 999
                                              ? 999
                                              : value;
                                    setAmount(value);
                                }}
                            />
                            <button
                                className={styles['input-add']}
                                onClick={() =>
                                    setAmount((prevAmount) => {
                                        let newAmount = prevAmount + 1;
                                        if (newAmount > 999) newAmount = 999;
                                        return newAmount;
                                    })
                                }
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <span className={styles['product-description']}>
                        {productItem.desc}
                    </span>
                    <div className={styles['notebox']}>
                        <label
                            className={styles['notebox-label']}
                            htmlFor="product-detail-notebox"
                        >
                            {texts.noteInputLabel}
                        </label>
                        <textarea
                            ref={noteboxInput}
                            id="product-detail-notebox"
                            className={styles['notebox-input']}
                            placeholder={texts.noteInputPlaceholder}
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
            <div className={styles['content-footer']}>
                <div className={styles['content-footer-total']}>
                    <span className={styles['total-text']}>
                        {texts.totalLabel}
                    </span>
                    <span className={styles['total-amount']}>
                        {total
                            ? `${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`
                            : '0 ₫'}
                    </span>
                </div>
                <div className={styles['content-footer-buttons']}>
                    <button
                        className={styles['order-now-button']}
                        onClick={() => handleOrderNow()}
                    >
                        {texts.orderNowButton}
                    </button>
                    <button
                        className={styles['add-to-cart-button']}
                        onClick={() => handleAddToCart()}
                    >
                        <i className={classNames('fal fa-basket-shopping')} />
                        {texts.addToCartButton && <span className={styles['add-to-cart-button-text']}>{texts.addToCartButton}</span>}
                    </button>
                </div>
            </div>
            <button
                className={styles['modal-window-close-button']}
                onClick={() => setModalVisibility(false)}
            >
                <i className={classNames('fa-thin fa-xmark')} />
            </button>
        </div>
    );
};

ProductDetailModalWindow.propTypes = {
    productItem: PropTypes.any.isRequired,
};

export default ProductDetailModalWindow;
