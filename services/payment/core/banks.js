const axios = require('axios');
const User = require('../../../models/users');
const RunnerBankDetails = require('../../../models/runnerbankdetails');
const config = require('../config');
const { validateBankDetailsData, validateAccountData } = require('../validation');

const getBankList = async (countryCode = 'NG') => {
    try {
        console.log(`Fetching bank list for country: ${countryCode}`);
        
        const response = await axios.get(
            `${config.KORA_API_URL}/misc/banks?countryCode=${countryCode}`,
            {
                headers: {
                    Authorization: `Bearer ${config.KORA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('KoraPay bank list response received');
        
        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from KoraPay banks API');
        }
        
        const banks = response.data.data;
        
        const formattedBanks = banks.map(bank => ({
            bankCode: bank.code,
            bankName: bank.name,
            bankSlug: bank.slug,
            nibssBankCode: bank.nibss_bank_code,
            countryCode: bank.country || countryCode,
            isActive: true
        }));
        
        console.log(`Retrieved ${formattedBanks.length} banks for ${countryCode}`);
        
        return {
            success: true,
            countryCode: countryCode,
            totalBanks: formattedBanks.length,
            banks: formattedBanks,
            message: `Successfully retrieved ${formattedBanks.length} banks for ${countryCode}`
        };
        
    } catch (error) {
        console.error('Error fetching bank list:', error);
        
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        }
        
        throw new Error(`Failed to fetch bank list: ${error.message}`);
    }
};

const verifyBankAccount = async (accountData) => {
    try {
        validateAccountData(accountData);
        
        console.log(`Verifying bank account: ${accountData.account} for bank: ${accountData.bank}`);
        
        const koraPayload = {
            bank: accountData.bank,
            account: accountData.account
        };
        
        const response = await axios.post(
            `${config.KORA_API_URL}/misc/banks/resolve`,
            koraPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('KoraPay account verification response received');
        
        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from KoraPay account verification API');
        }
        
        const verificationData = response.data.data;
        
        const formattedResponse = {
            success: true,
            status: response.data.status || 'success',
            message: response.data.message || 'Account verified successfully',
            bankDetails: {
                bankName: verificationData.bank_name,
                bankCode: verificationData.bank_code,
                accountNumber: verificationData.account_number,
                accountName: verificationData.account_name
            },
            isVerified: true,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Bank account verified successfully`);
        console.log(`Bank: ${formattedResponse.bankDetails.bankName}`);
        console.log(`Account Name: ${formattedResponse.bankDetails.accountName}`);
        console.log(`Account Number: ${formattedResponse.bankDetails.accountNumber}`);
        
        return formattedResponse;
        
    } catch (error) {
        console.error('Error verifying bank account:', error);
        
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            
            if (error.response.status === 400) {
                throw new Error('Invalid bank code or account number provided');
            } else if (error.response.status === 404) {
                throw new Error('Bank account not found or invalid');
            }
        }
        
        throw new Error(`Failed to verify bank account: ${error.message}`);
    }
};

const addRunnerBankDetails = async (bankDetailsData) => {
    try {
        // Validate required fields
        const { runnerId, bankCode, accountNumber, accountName, bankName } = bankDetailsData;
        if (!runnerId || !bankCode || !accountNumber || !accountName || !bankName) {
            throw new Error('runnerId, bankCode, bankName, accountNumber, and accountName are required');
        }

        console.log(`Adding bank details for runner: ${runnerId}`);

        // Check if runner exists
        const runner = await User.findOne({
            where: {
                id: runnerId,
                role: 'Runner'
            }
        });

        if (!runner) {
            throw new Error(`User ${runnerId} is not a runner or does not exist`);
        }

        // Check if bank details already exist
        let bankDetails = await RunnerBankDetails.findOne({
            where: {
                runnerId,
                accountNumber
            }
        });

        if (bankDetails) {
            // Update existing record
            bankDetails.bankCode = bankCode;
            bankDetails.bankName = bankName;
            bankDetails.accountName = accountName;
            bankDetails.isVerified = true; // you can verify using KoraPay if needed
            bankDetails.isActive = true;
            bankDetails.verificationDate = new Date();
            await bankDetails.save();
            console.log(`Bank details updated successfully`);
        } else {
            // Create new record
            bankDetails = await RunnerBankDetails.create({
                runnerId,
                bankCode,
                bankName,
                accountNumber,
                accountName,
                isVerified: true,
                isActive: true,
                verificationDate: new Date()
            });
            console.log(`Bank details added successfully`);
        }

        return {
            success: true,
            bankDetailsId: bankDetails.id,
            runnerId: bankDetails.runnerId,
            bankDetails: {
                bankName: bankDetails.bankName,
                bankCode: bankDetails.bankCode,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName
            },
            isVerified: bankDetails.isVerified,
            isActive: bankDetails.isActive,
            message: 'Bank details added or updated successfully'
        };

    } catch (error) {
        console.error('Error adding runner bank details:', error);
        throw new Error(`Failed to add bank details: ${error.message}`);
    }
};

const getRunnerBankDetails = async (runnerId) => {
    try {
        const bankDetails = await RunnerBankDetails.findAll({
            where: { 
                runnerId: runnerId,
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        });
        
        return {
            success: true,
            runnerId: runnerId,
            bankDetails: bankDetails.map(detail => ({
                id: detail.id,
                bankName: detail.bankName,
                bankCode: detail.bankCode,
                accountNumber: detail.accountNumber,
                accountName: detail.accountName,
                isVerified: detail.isVerified,
                isActive: detail.isActive,
                verificationDate: detail.verificationDate,
                createdAt: detail.createdAt
            })),
            totalBanks: bankDetails.length,
            message: `Retrieved ${bankDetails.length} bank details`
        };
        
    } catch (error) {
        console.error('Error getting runner bank details:', error);
        throw new Error(`Failed to get bank details: ${error.message}`);
    }
};

module.exports = {
    getBankList,
    verifyBankAccount,
    addRunnerBankDetails,
    getRunnerBankDetails
};
