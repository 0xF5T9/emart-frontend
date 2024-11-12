/**
 * @file static-texts.ts
 * @description Static text used by components.
 */

'use strict';

const staticTexts = {
    brandName: 'Vy Food',
    announcementText: 'Giảm 15% cho đơn hàng từ 400.000₫ trở lên.',
    announcementCloseText: 'Nhấn vào để đóng thông báo',
    brandLogoAlt: 'Logo Vy Food.',
    heroBannerAlt: 'Hero banner.',
    backToHomePage404: 'Trờ về trang chủ',
    footer: {
        brandLogoAlt: 'Hình ảnh logo VyFood',
        subscribeTitle: 'Đăng ký nhận tin',
        subscribeText: 'Nhận thông tin mới nhất từ chúng tôi',
        subscribeInputPlaceholder: 'Nhập email của bạn',
        subscribeButton: 'Đăng ký',
        aboutUsLinkTitle: 'Về chúng tôi',
        aboutUsLinkText:
            'Vy Food là thương hiệu được thành lập vào năm 2022 với tiêu chí đặt chất lượng sản phẩm lên hàng đầu.',
        linksLinkTitle: 'Liên kết',
        menuLinkTitle: 'Thực đơn',
        contactLinkTitle: 'Liên hệ',
        footerCopyRightText: 'Copyright 2022 Vy Food. All Rights Reserved.',
    },
    api: {
        backend: {
            unknownError: 'Có lỗi xảy ra.',
            invalidEmail: 'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail).',
            invalidUsernameCharacters:
                'Tên tài khoản chứa ký tự không hợp lệ. [a-zA-Z0-9]',
            invalidUsernameLength:
                'Tên tài khoản phải có tối thiểu 6 ký tự và tối đa 16 ký tự.',
            invalidPasswordLength:
                'Mật khẩu phải có tối thiểu 8 ký tự và tối đa 32 ký tự.',
            invalidResetPasswordRequest: 'Yêu cầu không hợp lệ.',
            invalidUpdateUserInfoRequest: 'Yêu cầu không hợp lệ.',
            invalidUpdateEmailRequest: 'Yêu cầu không hợp lệ.',
            invalidUpdatePasswordRequest: 'Yêu cầu không hợp lệ.',
            invalidDeleteAccountRequest: 'Yêu cầu không hợp lệ.',
        },
    },
    productsView: {
        title: 'Khám phá thực đơn của chúng tôi',
        productImageAlt: 'Hình ảnh',
        orderButton: 'Đặt món',
        orderButtonOutOfStock: 'Hết món',
        emptyCategory: 'Hiện chưa có món ăn nào ở danh mục này',
        emptySearch: 'Không tìm thấy món này trong thực đơn',
        suggestion1: 'Bạn có thể nhấn vào',
        suggestionLink: 'đây',
        suggestion2: 'để xem tất cả món ăn trong thực đơn.',
        loadingText: 'Vui lòng chờ...',
        emptyTextTitle: 'Không có sản phẩm nào',
        emptyTextDesc: 'Bạn hãy quay lại sau nhé.',
        unavailableTextTitle: 'Hệ thống đang bảo trì',
        unavailableTextDesc: 'Bạn hãy quay lại sau nhé.',
        productDetailWindow: {
            productImageAlt: 'Hình ảnh',
            noteInputLabel: 'Ghi chú',
            noteInputPlaceholder: 'Nhập ghi chú...',
            totalLabel: 'Thành tiền',
            orderNowButton: 'Đặt hàng ngay',
        },
    },
    cartWindow: {
        title: 'Giỏ hàng',
        emptyCart: 'Không có sản phẩm nào trong giỏ hàng của bạn',
        totalLabel: 'Tổng tiền:',
        addMoreButton: 'Thêm món',
        orderNow: 'Thanh toán',
        noteLabel: 'Ghi chú',
        closeNoteInputButton: 'Đóng',
        emptyNote: 'Không có ghi chú',
        deleteCartItemButton: 'Xoá',
    },
    paymentWindow: {
        title: 'Thanh toán',
        customerNameInputFormMessageRequire: 'Vui lòng nhập tên người nhận',
        customerPhoneNumberInputFormMessageRequire:
            'Vui lòng nhập số điện thoại',
        customerAddressInputFormMessageRequire:
            'Vui lòng nhập địa chỉ nhận hàng',
        orderInfoCard: {
            title: 'Thông tin đơn hàng',
            deliveryMethodLabel: 'Hình thức giao hàng',
            shippingMethod: 'Giao tận nơi',
            pickupMethod: 'Tự đến lấy',
            deliveryTimeLabel: 'Thời gian giao hàng',
            deliveryNow: 'Giao ngay khi xong',
            deliveryTime: 'Giao vào giờ',
            pickupAtLabel: 'Lấy tại chi nhánh',
            pickupLocation1: '273 An Dương Vương, Phường 3, Quận 5',
            pickupLocation2: '04 Tôn Đức Thắng, Phường Bến Nghé, Quận 1',
            orderNoteLabel: 'Ghi chú đơn hàng',
            orderNotePlaceholder: 'Nhập ghi chú',
        },
        deliveryInfoCard: {
            title: 'Thông tin người nhận',
            customerNameInputPlaceholder: 'Tên người nhận',
            customerPhoneNumberInputPlaceholder: 'Số điện thoại người nhận',
            customerAddressInputPlaceholder: 'Địa chỉ nhận hàng',
        },
        invoiceCard: {
            title: 'Đơn hàng',
            subtotalLabel: 'Tiền hàng',
            subtotalLabelUnit: 'món',
            shippingFeeLabel: 'Phí vận chuyển',
            shippingFee: '30.000 ₫',
            agreementText1: 'Bằng việc bấm vào nút “Đặt hàng”, tôi đồng ý với',
            agreementTextLink: 'chính sách hoạt động',
            agreementText2: 'của chúng tôi.',
            totalLabel: 'Tổng tiền:',
            placeOrderButton: 'Đặt hàng',
        },
        cartItemsUpdatedToast: {
            title: 'Thông báo',
            message:
                'Giá trị giỏ hàng của bạn đã bị thay đổi do sản phẩm được cập nhật mới.',
        },
        placeOrderSuccessWindow: {
            title: 'Đặt hàng thành công',
            message: 'Đơn hàng của bạn đang được xử lý.',
            closeButton: 'Đóng',
        },
    },
    toast: {
        errorDefaultTitle: 'Lỗi',
    },
    profileSection: {
        settingItems: {
            accountInfo: 'Thông tin tài khoản',
            updatePassword: 'Cập nhật mật khẩu',
            deleteAccount: 'Xoá tài khoản',
        },
        userInfoCard: {
            title: 'Thông tin tài khoản',
            description: 'Cập nhật thông tin tài khoản của bạn.',
            userAvatarImageAlt: 'Hình ảnh người dùng',
            uploadButton: 'Tải ảnh lên',
            usernameInputLabel: 'Tên người dùng',
            usernameInputPlaceholder: 'Tên người dùng',
            emailInputLabel: 'Địa chỉ email',
            emailInputPlaceholder: 'Địa chỉ email',
            emailInputRequiredFormMessage: 'Vui lòng nhập địa chỉ email',
            roleInputLabel: 'Vai trò',
            roleInputPlaceholder: 'Vai trò',
            roleMember: 'Thành viên',
            roleAdmin: 'Quản trị viên',
            roleUnknown: 'Không xác định',
            createdAtInputLabel: 'Tạo lúc',
            successEmailUpdateRequest:
                'Kiểm tra email mới của bạn để xác nhận địa chỉ email mới.',
            refreshButton: 'Làm mới',
            saveButton: 'Lưu thay đổi',
        },
        updatePasswordCard: {
            title: 'Cập nhật mật khẩu',
            description: 'Cập nhật mật khẩu mới cho tài khoản.',
            currentPasswordInputLabel: 'Mật khẩu hiện tại',
            currentPasswordInputPlaceholder: 'Nhập mật khẩu hiện tại',
            currentPasswordInputRequiredFormMessage:
                'Vui lòng nhập mật khẩu hiện tại',
            newPasswordInputLabel: 'Mật khẩu mới',
            newPasswordInputPlaceholder: 'Nhập mật khẩu mới',
            newPasswordInputRequiredFormMessage: 'Vui lòng nhập mật khẩu mới',
            newPasswordInputMatchOldPasswordFormMessage:
                'Mật khẩu mới trùng với mật khẩu cũ',
            confirmNewPasswordInputLabel: 'Mật khẩu mới',
            confirmNewPasswordInputPlaceholder: 'Nhập lại mật khẩu mới',
            confirmNewPasswordInputRequiredFormMessage:
                'Vui lòng nhập lại mật khẩu mới',
            confirmNewPasswordInputNotMatchFormMessage:
                'Mật khẩu không trùng khớp',
            updateButton: 'Cập nhật mật khẩu',
        },
        deleteAccountCard: {
            title: 'Xoá tài khoản',
            description:
                'Xoá tài khoản là vĩnh viễn và là hành động không thể phục hồi.',
            currentPasswordInputPlaceholder: 'Nhập mật khẩu để xác nhận',
            confirmButton: 'Xác nhận',
            confirmationWindowTitle: 'Xác nhận',
            confirmationWindowMessage: 'Bạn có chắc muốn xoá tài khoản?',
            confirmationWindowCancelButton: 'Huỷ',
            confirmationWindowConfirmButton: 'Xác nhận',
            deleteSuccessWindowTitle: 'Thành công',
            deleteSuccessWindowMessage: 'Tài khoản đã được xoá thành công.',
            deleteSuccessWindowCloseButton: 'Đóng',
        },
    },
    adminSection: {
        products: {
            title: 'Quản lý sản phẩm',
            categoryAllSelectText: 'Tất cả',
            searchProductInputPlaceholder: 'Tìm sản phẩm',
            refreshButton: 'Làm mới',
            addButton: 'Thêm sản phẩm',
            itemUnitText: 'Sản phẩm',
            quantityText: 'Số lượng',
            loadingText: 'Đang tải dữ liệu ...',
            emptyText: 'Không có sản phẩm nào',
            errorText: 'Không kết nối được đến hệ thống',
            deleteProductConfirmationWindow: {
                title: 'Xác nhận',
                message: 'Bạn có chắc muốn xoá sản phẩm?',
                cancelButton: 'Huỷ',
                confirmButton: 'Xác nhận',
            },
            createProductWindow: {
                title: 'Thêm sản phẩm',
                productImageAlt: 'Hình ảnh sản phẩm',
                uploadButton: 'Tải ảnh lên',
                createButton: 'Tạo sản phẩm',
                nameInputLabel: 'Tên sản phẩm',
                nameInputPlaceholder: 'Nhập tên sản phẩm',
                nameInputFormMessageRequire: 'Vui lòng nhập tên sản phẩm',
                categoryInputLabel: 'Danh mục',
                priceInputLabel: 'Giá sản phẩm',
                priceInputPlaceholder: 'Nhập giá sản phẩm',
                priceInputFormMessageRequire:
                    'Vui lòng nhập giá sản phẩm (VNĐ)',
                quantityInputLabel: 'Số lượng',
                quantityInputPlaceholder: 'Nhập số lượng sản phẩm',
                quantityInputFormMessageRequire:
                    'Vui lòng nhập số lượng sản phẩm',
                priorityInputLabel: 'Độ ưu tiên',
                priorityInputPlaceholder: 'Nhập độ ưu tiên của sản phẩm',
                priorityInputFormMessageRequire:
                    'Vui lòng nhập độ ưu tiên của sản phẩm',
                descInputLabel: 'Thông tin sản phẩm',
                descInputPlaceholder: 'Nhập thông tin sản phẩm',
            },
            updateProductWindow: {
                title: 'Cập nhật sản phẩm',
                productImageAlt: 'Hình ảnh sản phẩm',
                uploadButton: 'Tải ảnh lên',
                updateButton: 'Cập nhật',
                nameInputLabel: 'Tên sản phẩm',
                nameInputPlaceholder: 'Nhập tên sản phẩm',
                nameInputFormMessageRequire: 'Vui lòng nhập tên sản phẩm',
                categoryInputLabel: 'Danh mục',
                priceInputLabel: 'Giá sản phẩm',
                priceInputPlaceholder: 'Nhập giá sản phẩm',
                priceInputFormMessageRequire:
                    'Vui lòng nhập giá sản phẩm (VNĐ)',
                quantityInputLabel: 'Số lượng',
                quantityInputPlaceholder: 'Nhập số lượng sản phẩm',
                quantityInputFormMessageRequire:
                    'Vui lòng nhập số lượng sản phẩm',
                priorityInputLabel: 'Độ ưu tiên',
                priorityInputPlaceholder: 'Nhập độ ưu tiên của sản phẩm',
                priorityInputFormMessageRequire:
                    'Vui lòng nhập độ ưu tiên của sản phẩm',
                descInputLabel: 'Thông tin sản phẩm',
                descInputPlaceholder: 'Nhập thông tin sản phẩm',
            },
        },
        categories: {
            title: 'Quản lý danh mục',
            searchCategoryInputPlaceholder: 'Tìm danh mục',
            refreshButton: 'Làm mới',
            addButton: 'Thêm danh mục',
            itemUnitText: 'Danh mục',
            loadingText: 'Đang tải dữ liệu ...',
            emptyText: 'Không có danh mục nào',
            errorText: 'Không kết nối được đến hệ thống',
            deleteCategoryConfirmationWindow: {
                title: 'Xác nhận',
                message: 'Bạn có chắc muốn xoá danh mục?',
                cancelButton: 'Huỷ',
                confirmButton: 'Xác nhận',
            },
            createCategoryWindow: {
                title: 'Thêm danh mục',
                categoryImageAlt: 'Hình ảnh danh mục',
                uploadButton: 'Tải ảnh lên',
                createButton: 'Tạo danh mục',
                nameInputLabel: 'Tên danh mục',
                nameInputPlaceholder: 'Nhập tên danh mục',
                nameInputFormMessageRequire: 'Vui lòng nhập tên danh mục',
                priorityInputLabel: 'Độ ưu tiên',
                priorityInputPlaceholder: 'Nhập độ ưu tiên của danh mục',
                priorityInputFormMessageRequire:
                    'Vui lòng nhập độ ưu tiên của danh mục',
                descInputLabel: 'Thông tin danh mục',
                descInputPlaceholder: 'Nhập thông tin danh mục',
            },
            updateCategoryWindow: {
                title: 'Cập nhật danh mục',
                categoryImageAlt: 'Hình ảnh danh mục',
                uploadButton: 'Tải ảnh lên',
                updateButton: 'Cập nhật',
                nameInputLabel: 'Tên danh mục',
                nameInputPlaceholder: 'Nhập tên danh mục',
                nameInputFormMessageRequire: 'Vui lòng nhập tên danh mục',
                priorityInputLabel: 'Độ ưu tiên',
                priorityInputPlaceholder: 'Nhập độ ưu tiên của danh mục',
                priorityInputFormMessageRequire:
                    'Vui lòng nhập độ ưu tiên của danh mục',
                descInputLabel: 'Thông tin danh mục',
                descInputPlaceholder: 'Nhập thông tin danh mục',
            },
        },
        orders: {
            title: 'Quản lý đơn hàng',
            orderStatusAllSelectText: 'Tất cả',
            processingStatusOption: 'Đang xử lý',
            shippingStatusOption: 'Đang giao hàng',
            completedStatusOption: 'Hoàn thành',
            refundingStatusOption: 'Đang thu hàng',
            abortedStatusOption: 'Đã huỷ',
            refundedStatusOption: 'Đã hoàn tiền',
            shippingDeliveryMethod: 'Giao tận nơi',
            pickupDeliveryMethod: 'Tự đến lấy',
            searchOrderInputPlaceholder: 'Tìm đơn hàng',
            refreshButton: 'Làm mới',
            itemUnitText: 'Đơn hàng',
            loadingText: 'Đang tải dữ liệu ...',
            emptyText: 'Không có đơn hàng nào',
            errorText: 'Không kết nối được đến hệ thống',
            idColumn: 'ID',
            createdAtColumn: 'Tạo lúc',
            customerNameColumn: 'Tên',
            customerPhoneColumn: 'Số điện thoại',
            statusColumn: 'Trạng thái',
            deliveryMethodColumn: 'Hình thức',
            orderDetailsWindow: {
                title: 'Chi tiết đơn hàng',
                productItemEmptyNote: 'Không có ghi chú',
                itemAmount: 'Số lượng:',
                deliveryMethodTitle: 'Phương thức giao hàng',
                shippingDeliveryMethod: 'Giao tận nơi',
                pickupDeliveryMethod: 'Tự đến lấy',
                createdAtTitle: 'Đơn hàng tạo lúc',
                deliveryTimeTitle: 'Thời gian giao hàng',
                deliveryNow: 'Ngay bây giờ',
                deliveryAddressTitle: 'Địa chỉ giao hàng',
                pickupAddressTitle: 'Chi nhánh lấy hàng',
                customerNameTitle: 'Tên khách hàng',
                customerPhoneTitle: 'Số điện thoại',
                deliveryNoteTitle: 'Ghi chú đơn hàng',
                emptyDeliveryNote: '(Không có)',
                totalPriceTitle: 'Thành tiền',
                shippingFeeIncluded: '(Đã bao gồm 30k phí vận chuyển)',
                statusTitle: 'Trạng thái',
                processingStatusOption: 'Đang xử lý',
                shippingStatusOption: 'Đang giao hàng',
                completedStatusOption: 'Hoàn thành',
                refundingStatusOption: 'Đang thu hàng',
                abortedStatusOption: 'Đã huỷ',
                refundedStatusOption: 'Đã hoàn tiền',
                oldTotalTooltip: 'Tổng giá trị đơn hàng tại thời điểm đặt hàng',
                newTotalTooltip: 'Tổng giá trị đơn hàng tại thời điểm bây giờ',
                oldProductPriceTooltip:
                    'Giá trị sản phẩm tại thời điểm đặt hàng',
                newProductPriceTooltip:
                    'Giá trị sản phẩm tại thời điểm bây giờ',
            },
            deleteOrderConfirmationWindow: {
                title: 'Xác nhận',
                message: 'Bạn có chắc muốn xoá đơn hàng này?',
                cancelButton: 'Huỷ',
                confirmButton: 'Xác nhận',
            },
            restoreProductQuantityConfirmationWindow: {
                title: 'Xác nhận',
                message: 'Bạn có muốn nhập lại số hàng vào kho?',
                cancelButton: 'Huỷ',
                confirmButton: 'Xác nhận',
            },
        },
        users: {
            title: 'Quản lý người dùng',
            searchUserInputPlaceholder: 'Tìm người dùng',
            refreshButton: 'Làm mới',
            addButton: 'Thêm người dùng',
            itemUnitText: 'Người dùng',
            loadingText: 'Đang tải dữ liệu ...',
            emptyText: 'Không có người dùng nào',
            errorText: 'Không kết nối được đến hệ thống',
            idColumn: 'ID',
            usernameColumn: 'Tên người dùng',
            emailColumn: 'Email',
            roleColumn: 'Vai trò',
            roleMember: 'Thành viên',
            roleAdmin: 'Quản trị viên',
            roleUnknown: 'Không xác định',
            createdAtColumn: 'Tạo lúc',
            createUserWindow: {
                title: 'Thêm người dùng',
                userAvatarImageAlt: 'Hình ảnh người dùng',
                uploadButton: 'Tải ảnh lên',
                createButton: 'Tạo người dùng',
                emailInputLabel: 'Email',
                emailInputPlaceholder: 'Nhập địa chỉ email',
                emailInputFormMessageRequire: 'Vui lòng nhập địa chỉ email',
                emailInputFormMessageInvalidEmail:
                    'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail).',
                usernameInputLabel: 'Tên người dùng',
                usernameInputPlaceholder: 'Nhập tên người dùng',
                usernameInputFormMessageRequire: 'Vui lòng nhập tên người dùng',
                usernameInputFormMessageInvalidUsernameCharacters:
                    'Tên tài khoản chứa ký tự không hợp lệ. [a-zA-Z0-9]',
                usernameInputFormMessageInvalidUsernameLength:
                    'Tên tài khoản phải có tối thiểu 6 ký tự và tối đa 16 ký tự.',
                passwordInputLabel: 'Mật khẩu',
                passwordInputPlaceholder: 'Nhập mật khẩu',
                passwordInputFormMessageRequire: 'Vui lòng nhập mật khẩu',
                passwordInputFormMessageInvalidPasswordLength:
                    'Mật khẩu phải có tối thiểu 8 ký tự và tối đa 32 ký tự.',
                roleInputLabel: 'Vai trò',
                roleInputPlaceholder: 'Nhập vai trò',
                roleInputFormMessageRequire: 'Vui lòng nhập vai trò người dùng',
            },
            updateUserWindow: {
                title: 'Cập nhật người dùng',
                userAvatarImageAlt: 'Hình ảnh người dùng',
                uploadButton: 'Tải ảnh lên',
                updateButton: 'Cập nhật',
                emailInputLabel: 'Email',
                emailInputPlaceholder: 'Nhập địa chỉ email',
                emailInputFormMessageRequire: 'Vui lòng nhập địa chỉ email',
                emailInputFormMessageInvalidEmail:
                    'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail).',
                usernameInputLabel: 'Tên người dùng',
                usernameInputPlaceholder: 'Nhập tên người dùng',
                usernameInputFormMessageRequire: 'Vui lòng nhập tên người dùng',
                usernameInputFormMessageInvalidUsernameCharacters:
                    'Tên tài khoản chứa ký tự không hợp lệ. [a-zA-Z0-9]',
                usernameInputFormMessageInvalidUsernameLength:
                    'Tên tài khoản phải có tối thiểu 6 ký tự và tối đa 16 ký tự.',
                passwordInputLabel: 'Mật khẩu',
                passwordInputPlaceholder: 'Nhập mật khẩu mới',
                passwordInputFormMessageInvalidPasswordLength:
                    'Mật khẩu phải có tối thiểu 8 ký tự và tối đa 32 ký tự.',
                roleInputLabel: 'Vai trò',
                roleInputPlaceholder: 'Nhập vai trò',
                roleInputFormMessageRequire: 'Vui lòng nhập vai trò người dùng',
            },
            deleteUserConfirmationWindow: {
                title: 'Xác nhận',
                message: 'Bạn có chắc muốn xoá người dùng này?',
                cancelButton: 'Huỷ',
                confirmButton: 'Xác nhận',
            },
        },
    },
} as const;

export default staticTexts;
