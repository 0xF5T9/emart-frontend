/**
 * @file useModal.tsx
 * @description Modal hook.
 */

'use strict';
import type { Modal, ModalHook } from '@sources/ts/types/modal';
import {
    useState,
    useEffect,
    useMemo,
    useContext,
    createContext,
    FunctionComponent,
    ReactNode,
} from 'react';
import PropTypes from 'prop-types';

import { useGlobal } from './useGlobal';

// Modal context.
const modalContext = createContext(null);

/**
 * Modal context provider component.
 * @param props Component properties.
 * @param props.children Context children.
 * @returns Returns the component.
 */
const ModalProvider: FunctionComponent<{ children: ReactNode }> = function ({
    children,
}) {
    const { setAllowScrolling } = useGlobal();

    // 'modalVisibility' is used to check if there is an opening modal. (Don't use 'modal')
    // 'setModalVisibility' is used to close any opening modal programmatically.
    const [modal, setModal] = useState<Modal>(null),
        [modalVisibility, setModalVisibility] = useState(false);

    useEffect(() => {
        setModalVisibility(!!modal);
        setAllowScrolling(!!!modal);
    }, [modal]);

    const value: ModalHook = useMemo(
        () => ({
            modal,
            setModal,
            modalVisibility,
            setModalVisibility,
        }),
        [modal, modalVisibility]
    );

    return (
        <modalContext.Provider value={value}>{children}</modalContext.Provider>
    );
};

ModalProvider.propTypes = {
    children: PropTypes.node,
};

/**
 * Hook that create modal window.
 * @returns modal, setModal, modalVisibility, setModalVisibility
 */
function useModal(): ModalHook {
    return useContext(modalContext);
}

export { useModal, ModalProvider };
