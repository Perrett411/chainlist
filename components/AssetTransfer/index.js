import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';
import { useAuth } from '../../hooks/useAuth';

const AssetTransfer = () => {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [entities, setEntities] = useState([]);
  const [transfer, setTransfer] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    currency: 'USD',
    memo: '',
    transferType: 'internal',
    entityId: '',
    entityName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState('transfer');
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: 'business',
    taxId: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  // Check if user is administrator
  const isAdmin = user?.role === 'admin' && user?.permissions?.includes('admin');

  // Initialize with sample accounts, entities, and transfer history
  useEffect(() => {
    const sampleEntities = [
      {
        id: 'entity_001',
        name: 'Perrett & Associates LLC',
        type: 'corporation',
        taxId: 'EIN: 12-3456789',
        address: '123 Financial District, New York, NY 10005',
        contactPerson: 'John Perrett',
        email: 'admin@perrettassociates.com',
        phone: '+1 (555) 123-4567',
        createdAt: '2023-01-15',
        status: 'active'
      },
      {
        id: 'entity_002',
        name: 'TechCorp Investments',
        type: 'corporation',
        taxId: 'EIN: 98-7654321',
        address: '456 Tech Avenue, San Francisco, CA 94105',
        contactPerson: 'Sarah Johnson',
        email: 'contact@techcorp.com',
        phone: '+1 (555) 987-6543',
        createdAt: '2023-03-20',
        status: 'active'
      },
      {
        id: 'entity_003',
        name: 'Green Energy Solutions',
        type: 'business',
        taxId: 'EIN: 11-2233445',
        address: '789 Solar Street, Austin, TX 78701',
        contactPerson: 'Michael Green',
        email: 'info@greenenergy.com',
        phone: '+1 (555) 111-2233',
        createdAt: '2023-06-10',
        status: 'active'
      },
      {
        id: 'entity_004',
        name: 'Davis Family Trust',
        type: 'client',
        taxId: 'SSN: ***-**-4567',
        address: '321 Residential Ave, Miami, FL 33101',
        contactPerson: 'Robert Davis',
        email: 'rdavis@email.com',
        phone: '+1 (555) 444-5678',
        createdAt: '2023-08-05',
        status: 'active'
      }
    ];

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
        fee: 0,
        entityId: 'entity_001',
        entityName: 'Perrett & Associates LLC',
        entityType: 'corporation'
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
        fee: 0,
        entityId: 'entity_002',
        entityName: 'TechCorp Investments',
        entityType: 'corporation'
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
        fee: 15.00,
        entityId: 'entity_004',
        entityName: 'Davis Family Trust',
        entityType: 'client'
      }
    ];

    setAccounts(sampleAccounts);
    setEntities(sampleEntities);
    setTransferHistory(sampleHistory);
  }, []);

  const handleCreateEntity = () => {
    if (!newEntity.name || !newEntity.type) {
      alert('Please fill in entity name and type.');
      return;
    }

    const entity = {
      id: `entity_${Date.now()}`,
      name: newEntity.name,
      type: newEntity.type,
      taxId: newEntity.taxId,
      address: newEntity.address,
      contactPerson: newEntity.contactPerson,
      email: newEntity.email,
      phone: newEntity.phone,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setEntities([...entities, entity]);
    setIsCreatingEntity(false);
    setNewEntity({
      name: '',
      type: 'business',
      taxId: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: ''
    });
    alert('Entity created successfully!');
  };

  const handleTransfer = async () => {
    if (!transfer.fromAccount || !transfer.toAccount || !transfer.amount || !transfer.entityId) {
      alert('Please fill in all required fields including entity selection.');
      return;
    }

    if (transfer.fromAccount === transfer.toAccount) {
      alert('Source and destination accounts must be different.');
      return;
    }

    setIsProcessing(true);

    const selectedEntity = entities.find(ent => ent.id === transfer.entityId);
    
    // Check if this is a company asset transaction (Perrett & Associates LLC)
    const isCompanyTransaction = selectedEntity?.name === 'Perrett & Associates LLC';
    const requiresApproval = isCompanyTransaction || parseFloat(transfer.amount) >= 10000; // Also require approval for large amounts

    try {
      if (requiresApproval) {
        // Submit for approval workflow
        const approvalResponse = await fetch('/api/transactions/submit-for-approval', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            transactionId: `txn_${Date.now()}`,
            entityId: transfer.entityId,
            entityName: selectedEntity?.name || '',
            entityType: selectedEntity?.type || '',
            fromAccount: accounts.find(acc => acc.id === transfer.fromAccount)?.name || transfer.fromAccount,
            toAccount: transfer.transferType === 'external' ? transfer.toAccount : accounts.find(acc => acc.id === transfer.toAccount)?.name,
            amount: transfer.amount,
            currency: transfer.currency,
            transferType: transfer.transferType,
            memo: transfer.memo,
            requiresApproval: true
          })
        });

        if (!approvalResponse.ok) {
          throw new Error('Failed to submit transaction for approval');
        }

        // Add to transfer history with pending approval status
        const newTransfer = {
          id: `txn_${Date.now()}`,
          fromAccount: accounts.find(acc => acc.id === transfer.fromAccount)?.name,
          toAccount: transfer.transferType === 'external' ? transfer.toAccount : accounts.find(acc => acc.id === transfer.toAccount)?.name,
          amount: parseFloat(transfer.amount),
          currency: transfer.currency,
          status: 'pending_approval',
          date: new Date().toISOString(),
          memo: transfer.memo,
          type: transfer.transferType,
          fee: transfer.transferType === 'crypto' ? 15.00 : transfer.transferType === 'external' ? 25.00 : 0,
          entityId: transfer.entityId,
          entityName: selectedEntity?.name || '',
          entityType: selectedEntity?.type || '',
          requiresApproval: true
        };

        setTransferHistory([newTransfer, ...transferHistory]);
        
        alert(isCompanyTransaction 
          ? 'Company asset transaction submitted for administrator approval. You will be notified when approved.' 
          : 'Large amount transaction submitted for administrator approval. You will be notified when approved.'
        );
      } else {
        // Process immediately for non-company transactions under $10,000
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
          fee: transfer.transferType === 'crypto' ? 15.00 : transfer.transferType === 'external' ? 25.00 : 0,
          entityId: transfer.entityId,
          entityName: selectedEntity?.name || '',
          entityType: selectedEntity?.type || '',
          requiresApproval: false
        };

        setTransferHistory([newTransfer, ...transferHistory]);
        alert('Transfer initiated successfully!');
      }

    } catch (error) {
      console.error('Transfer submission error:', error);
      alert('Failed to submit transaction. Please try again.');
    }

    setTransfer({
      fromAccount: '',
      toAccount: '',
      amount: '',
      currency: 'USD',
      memo: '',
      transferType: 'internal',
      entityId: '',
      entityName: ''
    });
    
    setIsProcessing(false);
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
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'pending_approval': return 'bg-orange-100 text-orange-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityTypeColor = (type) => {
    switch (type) {
      case 'corporation': return 'bg-blue-100 text-blue-700';
      case 'business': return 'bg-green-100 text-green-700';
      case 'client': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'corporation': return '🏢';
      case 'business': return '🏪';
      case 'client': return '👤';
      default: return '📄';
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
            { id: 'entities', name: 'Entity Management', icon: '🏢' },
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
                  Entity (Required) *
                </label>
                <select
                  value={transfer.entityId}
                  onChange={(e) => {
                    const selectedEntity = entities.find(ent => ent.id === e.target.value);
                    setTransfer({
                      ...transfer, 
                      entityId: e.target.value,
                      entityName: selectedEntity?.name || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  required
                >
                  <option value="">Select business, corporation, or client...</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {getEntityIcon(entity.type)} {entity.name} ({entity.type.toUpperCase()})
                    </option>
                  ))}
                </select>
                {transfer.entityId && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                      Selected: {entities.find(e => e.id === transfer.entityId)?.name} • {entities.find(e => e.id === transfer.entityId)?.type}
                    </div>
                    {entities.find(e => e.id === transfer.entityId)?.name === 'Perrett & Associates LLC' && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Company Asset Transaction</span>
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          This transaction requires administrator approval before processing. You will be notified when reviewed.
                        </p>
                      </div>
                    )}
                    {parseFloat(transfer.amount || 0) >= 10000 && entities.find(e => e.id === transfer.entityId)?.name !== 'Perrett & Associates LLC' && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Large Amount Transfer</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Transfers over $10,000 require administrator approval for security purposes.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

      {/* Entity Management Tab */}
      {selectedTab === 'entities' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">
              Entity Management
            </h3>
            <button
              onClick={() => setIsCreatingEntity(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Entity
            </button>
          </div>

          {/* Create Entity Modal */}
          {isCreatingEntity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
                  Create New Entity
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Entity Name *
                      </label>
                      <input
                        type="text"
                        value={newEntity.name}
                        onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="Enter entity name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Entity Type *
                      </label>
                      <select
                        value={newEntity.type}
                        onChange={(e) => setNewEntity({...newEntity, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                      >
                        <option value="business">Business</option>
                        <option value="corporation">Corporation</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Tax ID / EIN
                      </label>
                      <input
                        type="text"
                        value={newEntity.taxId}
                        onChange={(e) => setNewEntity({...newEntity, taxId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="EIN: 12-3456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={newEntity.contactPerson}
                        onChange={(e) => setNewEntity({...newEntity, contactPerson: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="Contact person name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={newEntity.address}
                      onChange={(e) => setNewEntity({...newEntity, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                      placeholder="Full address..."
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newEntity.email}
                        onChange={(e) => setNewEntity({...newEntity, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newEntity.phone}
                        onChange={(e) => setNewEntity({...newEntity, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsCreatingEntity(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all dark:border-gray-600 dark:text-[#B3B3B3] dark:hover:bg-[#171717]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEntity}
                    className="flex-1 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Create Entity
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Entities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <div key={entity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getEntityIcon(entity.type)}</div>
                    <div>
                      <h4 className="font-semibold dark:text-[#B3B3B3] text-black">{entity.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEntityTypeColor(entity.type)}`}>
                        {entity.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {entity.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm dark:text-[#B3B3B3] text-gray-600 space-y-1">
                  {entity.taxId && <div><strong>Tax ID:</strong> {entity.taxId}</div>}
                  {entity.contactPerson && <div><strong>Contact:</strong> {entity.contactPerson}</div>}
                  {entity.email && <div><strong>Email:</strong> {entity.email}</div>}
                  {entity.phone && <div><strong>Phone:</strong> {entity.phone}</div>}
                  <div><strong>Created:</strong> {entity.createdAt}</div>
                </div>
              </div>
            ))}
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
                <div className="flex items-center justify-between mb-3">
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

                {/* Entity Information */}
                {txn.entityId && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-[#171717] rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getEntityIcon(txn.entityType)}</span>
                      <span className="font-medium dark:text-[#B3B3B3] text-black">{txn.entityName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEntityTypeColor(txn.entityType)}`}>
                        {txn.entityType?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                      Transaction processed under {txn.entityType} entity
                    </div>
                  </div>
                )}

                {txn.memo && (
                  <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mt-2 mb-2">
                    💬 "{txn.memo}"
                  </p>
                )}

                <div className="flex justify-between items-center text-xs dark:text-[#B3B3B3] text-gray-500">
                  <span>ID: {txn.id}</span>
                  <div className="flex gap-4">
                    <span>Type: {txn.type?.toUpperCase()}</span>
                    {txn.fee > 0 && <span>Fee: {formatCurrency(txn.fee)}</span>}
                  </div>
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