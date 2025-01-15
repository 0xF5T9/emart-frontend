/**
 * @file index.tsx
 * @desc Cart modal window.
 */

'use strict';
import type { CartItem } from '@sources/ts/apis/emart/types';
import {
    FunctionComponent,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAPI } from '@sources/ts/hooks/useAPI';
import { useModal } from '@sources/ts/hooks/useModal';
import PopupWindow, { PopupRender } from '@sources/ts/components/PopupWindow';
import PaymentWindow from '@sources/ts/components/PaymentWindow';
import Button from '@sources/ts/components/Button';
import * as styles from './CartModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.cartWindow;

/**
 * Cart item.
 * @param props Component properties.
 * @param props.index Cart item index.
 * @param props.cartItems Cart items.
 * @returns Returns the component.
 */
const CartItem: FunctionComponent<{
    index: number;
    cartItems: CartItem[];
}> = ({ index, cartItems }) => {
    const { setCartItems } = useAPI();

    const cartItem = cartItems[index];

    const [amount, setAmount] = useState(cartItem?.totalItems),
        [total, setTotal] = useState<number>(null);

    const handleDeleteCartItem = useCallback(() => {
        cartItems.splice(index, 1);
        setCartItems(JSON.stringify(cartItems));
    }, [cartItems]);

    const handleUpdateNoteCartItem = useCallback(
        (event: React.FocusEvent<HTMLTextAreaElement, Element>) => {
            cartItems[index].note = event?.currentTarget?.value;
            setCartItems(JSON.stringify(cartItems));
        },
        [cartItems]
    );

    useEffect(() => {
        cartItems[index].totalItems = amount;
        setCartItems(JSON.stringify(cartItems));

        if (cartItem?.product?.price)
            setTotal(cartItem?.product?.price * amount);
    }, [amount]);

    useEffect(() => {
        setAmount(cartItems[index].totalItems);
        if (cartItem?.product?.price)
            setTotal(cartItem?.product?.price * amount);
    }, [cartItems]);

    return (
        <li className={styles['cart-item']}>
            <div className={styles['cart-item-product-description']}>
                <span className={styles['cart-item-product-name']}>
                    {cartItem?.product?.name}
                </span>
                <span className={styles['cart-item-product-price']}>
                    {total
                        ? window.myHelper.convertUSDNumberToString(total || 0)
                        : window.myHelper.convertUSDNumberToString(0)}
                </span>
            </div>

            <PopupWindow
                interactive
                placement="bottom-start"
                trigger="click"
                appendTo={document.body}
                render={(attrs, content, instance) => (
                    <PopupRender>
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'column nowrap',
                                rowGap: '8px',
                            }}
                        >
                            <span
                                className={styles['cart-item-note-label']}
                                onClick={(event) =>
                                    (
                                        event?.currentTarget
                                            ?.nextElementSibling as HTMLTextAreaElement
                                    )?.focus()
                                }
                            >
                                {texts.noteLabel}
                            </span>
                            <textarea
                                className={styles['cart-item-note-edit-input']}
                                defaultValue={cartItem?.note}
                                onBlur={(event) =>
                                    handleUpdateNoteCartItem(event)
                                }
                                spellCheck={false}
                            />
                            <Button onClick={() => instance.hide()}>
                                {texts.closeNoteInputButton}
                            </Button>
                        </div>
                    </PopupRender>
                )}
            >
                <div className={styles['cart-item-note-wrapper']}>
                    <i
                        className={classNames(
                            styles['cart-item-note-icon'],
                            'fal fa-pencil'
                        )}
                    />

                    <span className={styles['cart-item-note-text']}>
                        {cartItem?.note || texts.emptyNote}
                    </span>
                </div>
            </PopupWindow>

            <div className={styles['cart-item-buttons-wrapper']}>
                <button
                    className={styles['cart-item-trash-button']}
                    onClick={() => handleDeleteCartItem()}
                >
                    <i className={classNames('far fa-trash')} />{' '}
                    {texts.deleteCartItemButton}
                </button>
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
                            let value = parseFloat(event.currentTarget.value);
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
        </li>
    );
};

CartItem.propTypes = {
    index: PropTypes.number,
    cartItems: PropTypes.array,
};

/**
 * Cart modal window.
 * @param props Component properties.
 * @returns Returns the component.
 */
const CartModalWindow: FunctionComponent = () => {
    const { cartItems, handleRefreshProduct } = useAPI();

    const { setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>();

    const [parsedCartItems, setParsedCartItem] = useState<CartItem[]>(() =>
        JSON.parse(cartItems)
    );

    const [total, setTotal] = useState(() => {
        if (!parsedCartItems) return 0;

        const totalNumber = parsedCartItems.reduce(
            (acc, current) => acc + current.totalItems * current.product.price,
            0
        );
        return totalNumber;
    });

    useEffect(() => {
        if (cartItems) setParsedCartItem(JSON.parse(cartItems) || []);
    }, [cartItems]);

    useEffect(() => {
        if (parsedCartItems) {
            const totalNumber = parsedCartItems.reduce(
                (acc, current) =>
                    acc + current.totalItems * current.product.price,
                0
            );
            setTotal(totalNumber);
        }
    }, [parsedCartItems]);

    useEffect(() => {
        (async () => {
            await handleRefreshProduct(true);
        })();
    }, []);

    return (
        <div ref={modalWindow} className={styles['modal-window']}>
            <div className={styles['cart-header']}>
                <div className={styles['header-title-wrapper']}>
                    <i
                        className={classNames(
                            styles['header-title-icon'],
                            'far fa-basket-shopping-simple'
                        )}
                    />
                    <span className={styles['header-title-text']}>
                        {texts.title}
                    </span>
                </div>
                <button
                    className={styles['header-close-button']}
                    onClick={() => setModalVisibility(false)}
                >
                    <i className={classNames('fas fa-xmark')} />
                </button>
            </div>
            <div className={styles['cart-body']}>
                {!parsedCartItems ||
                    (!parsedCartItems?.length && (
                        <div className={styles['cart-empty-content']}>
                            <i
                                className={classNames(
                                    styles['cart-empty-icon'],
                                    'fa-thin fa-cart-xmark'
                                )}
                            />
                            <span className={styles['cart-empty-text']}>
                                {texts.emptyCart}
                            </span>
                        </div>
                    ))}
                {parsedCartItems && !!parsedCartItems?.length && (
                    <ul className={styles['cart-list']}>
                        {[
                            parsedCartItems?.map((cartItem, index) => (
                                <CartItem
                                    key={cartItem.id}
                                    index={index}
                                    cartItems={parsedCartItems}
                                />
                            )),
                        ]}
                    </ul>
                )}
            </div>
            <div className={styles['cart-footer']}>
                <div className={styles['cart-total-wrapper']}>
                    <span className={styles['cart-total-label']}>
                        {texts.totalLabel}
                    </span>
                    <span className={styles['cart-total-price']}>
                        {window.myHelper.convertUSDNumberToString(total || 0)}
                    </span>
                </div>
                <div className={styles['cart-buttons-wrapper']}>
                    <button
                        className={styles['browse-more-button']}
                        onClick={() => setModalVisibility(false)}
                    >
                        <i className={classNames('far fa-plus')} />{' '}
                        {texts.addMoreButton}
                    </button>
                    <PaymentWindow>
                        <button
                            className={styles['payment-button']}
                            disabled={
                                !(
                                    !!parsedCartItems &&
                                    parsedCartItems?.length > 0
                                )
                            }
                        >
                            {texts.orderNow}
                        </button>
                    </PaymentWindow>
                </div>
            </div>
        </div>
    );
};

export default CartModalWindow;
export { styles as cartModalWindowStyles };
