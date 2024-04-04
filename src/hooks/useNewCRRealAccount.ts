import { useCallback, useEffect } from 'react';

import { useAuthData, useNewAccountReal } from '@deriv-com/api-hooks';

import { useRealAccountCreationContext } from '@/providers/RealAccountCreationProvider';

import { useSettings, useSyncLocalStorageClientAccounts } from '.';

/**
 * @name useNewCRRealAccount
 * @description A custom hook that creates a new real CR account.
 * @returns {Object} Submit handler function, the new real CR account data and the status of the request.
 */
export const useNewCRRealAccount = () => {
    const { setIsWizardOpen, state, setIsSuccessModalOpen } = useRealAccountCreationContext();

    const { data: newTradingAccountData, mutate: createAccount, status, ...rest } = useNewAccountReal();
    const { data: settingsData } = useSettings();

    const { addTradingAccountToLocalStorage } = useSyncLocalStorageClientAccounts();
    const { switchAccount } = useAuthData();

    useEffect(() => {
        if (status === 'success') {
            // fail-safe for typescript as the data type is also undefined
            if (!newTradingAccountData) return;

            addTradingAccountToLocalStorage(newTradingAccountData);
            switchAccount(newTradingAccountData?.client_id);
            setIsWizardOpen(false);
            setIsSuccessModalOpen(true);
        }
        // trigger validation error on status change when validation modal is created
    }, [
        addTradingAccountToLocalStorage,
        newTradingAccountData,
        setIsSuccessModalOpen,
        setIsWizardOpen,
        status,
        switchAccount,
    ]);

    /**
     * @name handleSubmit
     * @description A function that handles the form submission and calls the mutation.
     */
    const mutate = useCallback(() => {
        createAccount({
            residence: settingsData.country_code ?? '',
            first_name: state.firstName,
            last_name: state.lastName,
            currency: state.currency,
            address_line_1: state.firstLineAddress,
            address_line_2: state.secondLineAddress,
            address_city: state.townCity,
            address_state: state.stateProvince,
            address_postcode: state.zipCode,
            phone: state.phoneNumber,
            place_of_birth: state.placeOfBirth,
            date_of_birth: state.dateOfBirth,
            account_opening_reason: state.accountOpeningReason,
            ...(state.taxIdentificationNumber
                ? { tax_identification_number: state.taxIdentificationNumber, tax_residence: state.taxResidence }
                : {}),
        });
    }, [createAccount, settingsData.country_code, state]);

    return {
        mutate,
        data: newTradingAccountData,
        status,
        ...rest,
    };
};
