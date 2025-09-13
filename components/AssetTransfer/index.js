import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const AssetTransfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [transfer, setTransfer] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    currency: 'USD',
    memo: '',
    transferType: 'internal'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState('transfer');

  // Initialize with sample accounts and transfer history
  useEffect(() => {
    const sampleAccounts = [
      {
        id: 'checking_001',
        name: 'Primary Checking',
        type: 'checking',
        balance: 25750.00,
        currency: 'USD',
        accountNumber: '****1234',
        institution: 'Bank of America'
      },
      {
        id: 'savings_001',
        name: 'High Yield Savings',
        type: 'savings',
        balance: 65000.00,
        currency: 'USD',
        accountNumber: '****5678',
        institution: 'Goldman Sachs'
      },
      {
        id: 'crypto_001',
        name: 'Crypto Wallet',
        type: 'crypto',
        balance: 8.5,
        currency: 'BTC',
        accountNumber: '1A1z***...2e4',
        institution: 'MetaMask'
      },
      {
        id: 'investment_001',
        name: 'Investment Portfolio',
        type: 'investment',
        balance: 125750.00,
        currency: 'USD',
        accountNumber: '****9876',
        institution: 'Fidelity'
      },
      {
        id: 'crypto_002',
        name: 'Ethereum Wallet',
        type: 'crypto',
        balance: 45.2,
        currency: 'ETH',
        accountNumber: '0x742d***...9c8',
        institution: 'Coinbase Wallet'
      }
    ];

    const sampleHistory = [
      {
        id: 'txn_001',
        fromAccount: 'Primary Checking',
        toAccount: 'High Yield Savings',
        amount: 5000.00,
        currency: 'USD',
        status: 'completed',
        date: '2024-12-10T14:30:00Z',
        memo: 'Monthly savings transfer',
        type: 'internal',
        fee: 0
      },
      {
        id: 'txn_002',
        fromAccount: 'Investment Portfolio',
        toAccount: 'Primary Checking',
        amount: 2500.00,
        currency: 'USD',
        status: 'completed',
        date: '2024-12-08T09:15:00Z',
        memo: 'Dividend withdrawal',
        type: 'internal',
        fee: 0
      },
      {
        id: 'txn_003',
        fromAccount: 'Primary Checking',
        toAccount: 'Crypto Wallet',
        amount: 1000.00,
        currency: 'USD',
        status: 'pending',
        date: '2024-12-13T11:45:00Z',
        memo: 'Bitcoin purchase',
        type: 'crypto',
        fee: 15.00
      }
    ];

    setAccounts(sampleAccounts);
    setTransferHistory(sampleHistory);
  }, []);

  const handleTransfer = async () => {
    if (!transfer.fromAccount || !transfer.toAccount || !transfer.amount) {
      alert('Please fill in all required fields.');
      return;
    }

    if (transfer.fromAccount === transfer.toAccount) {
      alert('Source and destination accounts must be different.');
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTransfer = {
      id: `txn_${Date.now()}`,
      fromAccount: accounts.find(acc => acc.id === transfer.fromAccount)?.name,
      toAccount: transfer.transferType === 'external' ? transfer.toAccount : accounts.find(acc => acc.id === transfer.toAccount)?.name,
      amount: parseFloat(transfer.amount),
      currency: transfer.currency,
      status: 'pending',
      date: new Date().toISOString(),
      memo: transfer.memo,
      type: transfer.transferType,
      fee: transfer.transferType === 'crypto' ? 15.00 : transfer.transferType === 'external' ? 25.00 : 0
    };

    setTransferHistory([newTransfer, ...transferHistory]);
    setTransfer({
      fromAccount: '',
      toAccount: '',
      amount: '',
      currency: 'USD',
      memo: '',
      transferType: 'internal'
    });
    
    setIsProcessing(false);
    alert('Transfer initiated successfully!');
  };

  const formatCurrency = (amount, currency = 'USD') => {
    try {
      if (currency === 'BTC' || currency === 'ETH') {
        return `${amount.toFixed(4)} ${currency}`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking': return '🏦';
      case 'savings': return '💰';
      case 'crypto': return '₿';
      case 'investment': return '📈';
      default: return '💳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-[#B3B3B3] text-black mb-2">
              💸 Asset Transfer Center
            </h2>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              Transfer funds between accounts and manage your financial assets • {PERRETT_CONFIG.OWNER}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-4">
          {[
            { id: 'transfer', name: 'New Transfer', icon: '💸' },
            { id: 'history', name: 'Transfer History', icon: '📋' },
            { id: 'accounts', name: 'Account Overview', icon: '🏦' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 hover:bg-gray-200 dark:hover:bg-[#252525]'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* New Transfer Tab */}
      {selectedTab === 'transfer' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-6">
            Initiate New Transfer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transfer Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  Transfer Type
                </label>
                <select
                  value={transfer.transferType}
                  onChange={(e) => setTransfer({...transfer, transferType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                >
                  <option value="internal">Internal Transfer</option>
                  <option value="external">External Bank Transfer</option>
                  <option value="crypto">Crypto Transfer</option>
                  <option value="wire">Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  From Account
                </label>
                <select
                  value={transfer.fromAccount}
                  onChange={(e) => setTransfer({...transfer, fromAccount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                >
                  <option value="">Select source account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountIcon(account.type)} {account.name} - {formatCurrency(account.balance, account.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  To Account
                </label>
                {transfer.transferType === 'external' ? (
                  <input
                    type="text"
                    value={transfer.toAccount}
                    onChange={(e) => setTransfer({...transfer, toAccount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                    placeholder="Enter external account number or wallet address"
                  />
                ) : (
                  <select
                    value={transfer.toAccount}
                    onChange={(e) => setTransfer({...transfer, toAccount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  >
                    <option value="">Select destination account...</option>
                    {accounts.filter(acc => acc.id !== transfer.fromAccount).map((account) => (
                      <option key={account.id} value={account.id}>
                        {getAccountIcon(account.type)} {account.name} - {formatCurrency(account.balance, account.currency)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={transfer.amount}
                    onChange={(e) => setTransfer({...transfer, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={transfer.currency}
                    onChange={(e) => setTransfer({...transfer, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <textarea
                  value={transfer.memo}
                  onChange={(e) => setTransfer({...transfer, memo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  placeholder="Transfer description..."
                  rows="3"
                />
              </div>
            </div>

            {/* Transfer Summary */}
            <div className="bg-gray-50 dark:bg-[#171717] rounded-lg p-6">
              <h4 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
                Transfer Summary
              </h4>

              {transfer.fromAccount && transfer.toAccount && transfer.amount && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm dark:text-[#B3B3B3] text-gray-600">From:</span>
                    <span className="text-sm font-medium dark:text-[#B3B3B3] text-black">
                      {accounts.find(acc => acc.id === transfer.fromAccount)?.name || transfer.fromAccount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm dark:text-[#B3B3B3] text-gray-600">To:</span>
                    <span className="text-sm font-medium dark:text-[#B3B3B3] text-black">
                      {transfer.transferType === 'external' 
                        ? transfer.toAccount 
                        : accounts.find(acc => acc.id === transfer.toAccount)?.name
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm dark:text-[#B3B3B3] text-gray-600">Amount:</span>
                    <span className="text-sm font-medium dark:text-[#B3B3B3] text-black">
                      {formatCurrency(parseFloat(transfer.amount) || 0, transfer.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm dark:text-[#B3B3B3] text-gray-600">Fee:</span>
                    <span className="text-sm font-medium dark:text-[#B3B3B3] text-black">
                      {transfer.transferType === 'crypto' ? '$15.00' : 
                       transfer.transferType === 'external' ? '$25.00' : 
                       transfer.transferType === 'wire' ? '$45.00' : '$0.00'}
                    </span>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-600" />

                  <div className="flex justify-between">
                    <span className="text-sm font-medium dark:text-[#B3B3B3] text-black">Total:</span>
                    <span className="text-sm font-bold dark:text-[#B3B3B3] text-black">
                      {formatCurrency(
                        (parseFloat(transfer.amount) || 0) + 
                        (transfer.transferType === 'crypto' ? 15 : 
                         transfer.transferType === 'external' ? 25 : 
                         transfer.transferType === 'wire' ? 45 : 0), 
                        transfer.currency
                      )}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTransfer}
                disabled={isProcessing || !transfer.fromAccount || !transfer.toAccount || !transfer.amount}
                className="w-full mt-6 px-4 py-3 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Initiate Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer History Tab */}
      {selectedTab === 'history' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-6">
            Transfer History
          </h3>

          <div className="space-y-4">
            {transferHistory.map((txn) => (
              <div key={txn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      💸
                    </div>
                    <div>
                      <div className="font-medium dark:text-[#B3B3B3] text-black">
                        {txn.fromAccount} → {txn.toAccount}
                      </div>
                      <div className="text-sm dark:text-[#B3B3B3] text-gray-600">
                        {new Date(txn.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold dark:text-[#B3B3B3] text-black">
                      {formatCurrency(txn.amount, txn.currency)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}>
                      {txn.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {txn.memo && (
                  <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mt-2">
                    "{txn.memo}"
                  </p>
                )}

                <div className="flex justify-between items-center mt-2 text-xs dark:text-[#B3B3B3] text-gray-500">
                  <span>Transaction ID: {txn.id}</span>
                  {txn.fee > 0 && <span>Fee: {formatCurrency(txn.fee)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Overview Tab */}
      {selectedTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{getAccountIcon(account.type)}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {account.type.toUpperCase()}
                </span>
              </div>

              <h3 className="font-semibold dark:text-[#B3B3B3] text-black mb-2">
                {account.name}
              </h3>

              <div className="text-2xl font-bold dark:text-[#B3B3B3] text-black mb-2">
                {formatCurrency(account.balance, account.currency)}
              </div>

              <div className="text-sm dark:text-[#B3B3B3] text-gray-600 space-y-1">
                <div>Account: {account.accountNumber}</div>
                <div>Institution: {account.institution}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetTransfer;