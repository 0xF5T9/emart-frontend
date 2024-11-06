/**
 * @file index.tsx
 * @description User management.
 */

'use strict';
import type { User } from '@sources/ts/types/VyFood';
import {
    FunctionComponent,
    CSSProperties,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import CreateUserModalWindow from './components/CreateUserModalWindow';
import UpdateUserModalWindow from './components/UpdateUserModalWindow';
import * as styles from './Users.module.css';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.adminSection.users;

// https://stackoverflow.com/questions/43080547/how-to-override-type-properties-in-typescript
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type TUser = Overwrite<User, { index: number }>;

/**
 * User item.
 * @param props Component properties.
 * @param props.item User item.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const UserItem: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLTableRowElement>,
        HTMLTableRowElement
    > & { item: TUser; refreshCallback: (silentFetch: boolean) => void }
> = ({ item, refreshCallback }) => {
    const { sessionData, logout } = useAuth(),
        { setModal, setModalVisibility } = useModal();

    const [isPending, setIsPending] = useState(false);

    const handleUpdateUser = useCallback(() => {
        setModal({
            type: 'custom',
            content: (
                <UpdateUserModalWindow
                    user={item}
                    refreshCallback={refreshCallback}
                />
            ),
        });
    }, [item]);

    const handleDeleteUserConfirmation = (user: User) => {
        setModal({
            type: 'alert',
            title: texts.deleteUserConfirmationWindow.title,
            message: texts.deleteUserConfirmationWindow.message,
            removeDefaultCloseButton: true,

            customButton: (
                <>
                    <Button
                        className="default"
                        color="gray"
                        style={
                            {
                                '--button-background-color-default': '#999999',
                            } as CSSProperties
                        }
                        onClick={() => setModalVisibility(false)}
                    >
                        {texts.deleteUserConfirmationWindow.cancelButton}
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteUser(user);
                            setModalVisibility(false);
                        }}
                    >
                        {texts.deleteUserConfirmationWindow.confirmButton}
                    </Button>
                </>
            ),
        });
    };

    const handleDeleteUser = (user: User) => {
        if (isPending) return;
        setIsPending(true);

        (async () => {
            const { message, success } = await apis.backend.deleteUserAsAdmin(
                user?.username
            );
            if (!success) {
                console.error(message);
                setTimeout(
                    () =>
                        showToast({
                            variant: 'danger',
                            title: staticTexts.toast.errorDefaultTitle,
                            message,
                            duration: 5000,
                        }),
                    100
                );
                setIsPending(false);
                return;
            }

            setIsPending(false);
            if (user?.username === sessionData?.username) {
                logout();
                return;
            }

            if (refreshCallback) refreshCallback(true);
        })();
    };

    return (
        <tr
            className={classNames(styles['user-item-row'])}
            key={item?.username}
        >
            <td className={styles['table-field-id']}>
                <a
                    className={styles['table-field-id-link']}
                    onClick={() => handleUpdateUser()}
                >
                    {item?.index}
                </a>
            </td>
            <td>{item?.username}</td>
            <td>{item?.email}</td>
            <td>
                {item?.role === 'admin'
                    ? texts.roleAdmin
                    : item?.role === 'member'
                      ? texts.roleMember
                      : texts.roleUnknown}
            </td>
            <td>{item?.createdAt.toLocaleString('en-US')}</td>
            <td className={styles['table-field-action']}>
                <Button
                    className={styles['update-user-button']}
                    onClick={() => handleUpdateUser()}
                >
                    <i className={classNames('fal fa-pen-to-square')} />
                </Button>
                <Button
                    disabled={isPending}
                    onClick={() => handleDeleteUserConfirmation(item)}
                >
                    <i className={classNames('fal fa-trash')} />
                </Button>
            </td>
        </tr>
    );
};

UserItem.propTypes = {
    item: PropTypes.any.isRequired,
    refreshCallback: PropTypes.func.isRequired,
};

/**
 * User management.
 * @param props Component properties.
 * @param props.itemsPerPage Item per page.
 * @param props.onPaginationChange On pagination change callback.
 * @returns Returns the component.
 */
const Users: FunctionComponent<{
    itemsPerPage?: number;
    onPaginationChange?: (...args: any[]) => void;
}> = ({ itemsPerPage = 12, onPaginationChange }) => {
    const { setModal } = useModal();

    const userWrapper = useRef<HTMLDivElement>(null),
        searchInput = useRef<HTMLInputElement>(null);

    const [searchInputValue, setSearchInputValue] = useState('');

    const [users, setUsers] = useState<TUser[]>(null),
        [filteredUsers, setFilteredUsers] = useState<TUser[]>(null);

    const [isPending, setIsPending] = useState(false);

    const [status, setStatus] = useState<
        'idle' | 'loading' | 'empty' | 'error'
    >('loading');

    const [pagination, setPagination] = useState(1);

    const indexOfLastItem = pagination * itemsPerPage,
        indexOfFirstItem = indexOfLastItem - itemsPerPage,
        renderItems = filteredUsers
            ?.slice(indexOfFirstItem, indexOfLastItem)
            ?.sort((a, b) => {
                return b?.createdAt?.getTime() - a?.createdAt?.getTime();
            });

    const totalPagination = [];
    if (filteredUsers)
        for (
            let i = 1;
            i <= Math.ceil(filteredUsers.length / itemsPerPage);
            i++
        )
            totalPagination.push(i);

    const handleRefresh = (silentFetch: boolean = false) => {
        if (isPending) return;

        setIsPending(true);
        if (!silentFetch) setStatus('loading');
        (async () => {
            const getUsersResult = await apis.backend.getUsersAsAdmin();
            if (!getUsersResult.success) {
                console.error(getUsersResult.message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: getUsersResult.message,
                    duration: 5000,
                });
                setStatus('error');
                setIsPending(false);
            }

            const rawUsers = getUsersResult.data?.users,
                transformedUsers: TUser[] = rawUsers?.map((uUser, index) => {
                    const user: TUser = {
                        index: index + 1,
                        ...uUser,
                        avatarFileName: uUser?.avatarFileName
                            ? `${process.env.UPLOAD_URL}/avatar/${uUser.avatarFileName}`
                            : staticUrls.avatarPlaceholder,
                        createdAt: new Date(uUser.createdAt),
                    };
                    return user;
                });

            setUsers(transformedUsers);
            setStatus(transformedUsers?.length ? 'idle' : 'empty');
            setIsPending(false);
        })();
    };

    const handlePaginationChange = (pageNumber: number) => {
        if (pageNumber > totalPagination.length)
            pageNumber = totalPagination.length;
        else if (pageNumber < 1) pageNumber = 1;
        setPagination(pageNumber);
        if (onPaginationChange) onPaginationChange();
    };

    const handleCreateUser = () => {
        setModal({
            type: 'custom',
            content: <CreateUserModalWindow refreshCallback={handleRefresh} />,
        });
    };

    useEffect(() => {
        const newFilteredUsers = users?.filter((item) => {
            let searchByMode: 'USERNAME' | 'EMAIL' =
                searchInput.current?.value?.includes('@')
                    ? 'EMAIL'
                    : 'USERNAME';
            switch (searchByMode) {
                case 'USERNAME': {
                    if (
                        searchInput.current?.value &&
                        !item.username
                            .toLowerCase()
                            .includes(searchInput.current?.value?.toLowerCase())
                    )
                        return false;
                    break;
                }
                case 'EMAIL': {
                    if (
                        searchInput.current?.value &&
                        !item.email
                            .toLowerCase()
                            .includes(searchInput.current?.value?.toLowerCase())
                    )
                        return false;
                    break;
                }
            }

            return true;
        });

        // setPagination(1);
        setFilteredUsers(newFilteredUsers);
        if (status !== 'loading')
            setStatus(newFilteredUsers?.length ? 'idle' : 'empty');
    }, [users, searchInputValue]);

    useEffect(() => {
        handleRefresh();
    }, []);

    return (
        <div className={styles['content-wrapper']}>
            <span className={styles['title']}>{texts.title}</span>
            <div className={styles['controls-wrapper']}>
                <div className={styles['controls-inputs']}>
                    <Input
                        inputRef={searchInput}
                        id="admin-search-user-input"
                        className={styles['search-input']}
                        height={40}
                        icon={{
                            position: 'left',
                            icon: 'fal fa-magnifying-glass',
                        }}
                        placeholder={texts.searchUserInputPlaceholder}
                        spellCheck={false}
                        disabled={isPending || status === 'error'}
                        value={searchInputValue}
                        onChange={(event) =>
                            setSearchInputValue(event.currentTarget.value)
                        }
                    />
                </div>
                <div className={styles['controls-buttons']}>
                    <Button
                        id="refresh-users-button"
                        className={styles['control-button']}
                        height={40}
                        disabled={isPending || status === 'error'}
                        onClick={() => {
                            handleRefresh();
                        }}
                        loading={status === 'loading'}
                    >
                        <i className={classNames('fal fa-rotate-right')} />{' '}
                        <span>{texts.refreshButton}</span>
                    </Button>
                    <Button
                        id="add-user-button"
                        className={styles['control-button']}
                        onClick={() => handleCreateUser()}
                        height={40}
                        disabled={isPending || status === 'error'}
                    >
                        <i className={classNames('fal fa-plus')} />{' '}
                        <span>{texts.addButton}</span>
                    </Button>
                </div>
            </div>
            <span className={styles['users-count']}>
                {filteredUsers?.length || 0} {texts.itemUnitText}
            </span>
            <div ref={userWrapper} className={styles['users-wrapper']}>
                {status === 'idle' && (
                    <div className={styles['table-wrapper']}>
                        <table className={styles['table']}>
                            <thead className={styles['table-head']}>
                                <tr>
                                    <th>{texts.idColumn}</th>
                                    <th>{texts.usernameColumn}</th>
                                    <th>{texts.emailColumn}</th>
                                    <th>{texts.roleColumn}</th>
                                    <th>{texts.createdAtColumn}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className={styles['table-body']}>
                                {renderItems?.map((item) => (
                                    <UserItem
                                        key={item?.username}
                                        item={item}
                                        refreshCallback={handleRefresh}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {status === 'loading' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.loadingText}
                        </span>
                        <CircleLoading
                            className={styles['status-loading-icon']}
                        />
                    </div>
                )}
                {status === 'empty' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.emptyText}
                        </span>
                        <i
                            className={classNames(
                                styles['status-icon'],
                                'fal fa-empty-set'
                            )}
                        />
                    </div>
                )}
                {status === 'error' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.errorText}
                        </span>
                        <i
                            className={classNames(
                                styles['status-icon'],
                                'fal fa-cloud-slash'
                            )}
                        />
                    </div>
                )}
            </div>
            <div className={styles['pagination-button-list']}>
                {totalPagination &&
                    totalPagination.length <= 5 &&
                    totalPagination.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            className={classNames(styles['pagination-button'], {
                                [styles['current']]: pageNumber === pagination,
                            })}
                            onClick={() => handlePaginationChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    ))}
                {totalPagination && totalPagination.length > 5 && (
                    <>
                        <button
                            className={classNames(styles['pagination-button'])}
                            onClick={() =>
                                handlePaginationChange(pagination - 1)
                            }
                        >
                            <i className={'fas fa-caret-left'} />
                        </button>

                        {pagination === totalPagination.length && (
                            <>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() =>
                                        handlePaginationChange(
                                            totalPagination.length - 4
                                        )
                                    }
                                >
                                    {totalPagination.length - 4}
                                </button>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() =>
                                        handlePaginationChange(
                                            totalPagination.length - 3
                                        )
                                    }
                                >
                                    {totalPagination.length - 3}
                                </button>
                            </>
                        )}
                        {pagination === totalPagination.length - 1 && (
                            <button
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(
                                        totalPagination.length - 4
                                    )
                                }
                            >
                                {totalPagination.length - 4}
                            </button>
                        )}

                        {pagination - 2 >= 1 && (
                            <button
                                key={`${pagination - 2}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={(event) => {
                                    document.querySelector('button').click();

                                    handlePaginationChange(pagination - 2);
                                }}
                            >
                                {pagination - 2}
                            </button>
                        )}

                        {pagination - 1 >= 1 && (
                            <button
                                key={`${pagination - 1}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination - 1)
                                }
                            >
                                {pagination - 1}
                            </button>
                        )}

                        <button
                            key={`${pagination}/${totalPagination}`}
                            className={classNames(
                                styles['pagination-button'],
                                styles['current']
                            )}
                        >
                            {pagination}
                        </button>

                        {pagination + 1 <= totalPagination.length && (
                            <button
                                key={`${pagination + 1}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination + 1)
                                }
                            >
                                {pagination + 1}
                            </button>
                        )}

                        {pagination + 2 <= totalPagination.length && (
                            <button
                                key={`${pagination + 2}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination + 2)
                                }
                            >
                                {pagination + 2}
                            </button>
                        )}

                        {pagination === 1 && (
                            <>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() => handlePaginationChange(4)}
                                >
                                    4
                                </button>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() => handlePaginationChange(4)}
                                >
                                    5
                                </button>
                            </>
                        )}

                        {pagination === 2 && (
                            <button
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() => handlePaginationChange(4)}
                            >
                                5
                            </button>
                        )}

                        <button
                            className={classNames(styles['pagination-button'])}
                            onClick={() =>
                                handlePaginationChange(pagination + 1)
                            }
                        >
                            <i className={'fas fa-caret-right'} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

Users.propTypes = {
    itemsPerPage: PropTypes.number,
    onPaginationChange: PropTypes.func,
};

export default Users;
