import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Views
import OverviewView from './views/OverviewView';
import CustomersView from './views/CustomersView';
import QuotationsView from './views/QuotationsView';
import InvoicesView from './views/InvoicesView';
import PaymentsView from './views/PaymentsView';
import ReportsView from './views/ReportsView';
import LoginView from './views/LoginView';

// Modals & Drawers
import RegisterCustomerModal from './components/RegisterCustomerModal';
import RecordPaymentModal from './components/RecordPaymentModal';
import CreateQuotationModal from './components/CreateQuotationModal';
import QuotationPdfModal from './components/QuotationPdfModal';
import InvoicePdfModal from './components/InvoicePdfModal';
import ReceiptModal from './components/ReceiptModal';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';

function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentPreselectedInvoice, setPaymentPreselectedInvoice] = useState(null);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [quotePreselectedCustomer, setQuotePreselectedCustomer] = useState(null);

  // PDF & Drawer Modals
  const [selectedQuotationForPdf, setSelectedQuotationForPdf] = useState(null);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [drawerCustomerId, setDrawerCustomerId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center text-[#38BDF8] font-sans text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Brightloop Operations...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#0B1020] font-sans text-[#F1F5F9] antialiased relative overflow-x-hidden">
      {/* Sidebar - Fixed width 256px */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onQuickSearch={() => {}}
      />

      {/* Main Content Area */}
      <div
        className={`relative z-10 transition-all duration-200 min-h-screen flex flex-col ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Header */}
        <Navbar
          activeTab={activeTab}
          collapsed={collapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNotificationClick={() => setActiveTab('notifications')}
        />

        {/* Dynamic Views */}
        <main className="w-full pt-14 px-8 pb-12 flex-1 max-w-[1600px] mx-auto">
          {activeTab === 'overview' && (
            <OverviewView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              onOpenRegister={() => setIsRegisterOpen(true)}
              onOpenCustomerDrawer={(id) => setDrawerCustomerId(id)}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              onOpenCreateModal={() => {
                setQuotePreselectedCustomer(null);
                setIsCreateQuoteOpen(true);
              }}
              onOpenPdfModal={(q) => setSelectedQuotationForPdf(q)}
              onNavigateToCustomer={(custId) => {
                setDrawerCustomerId(custId);
                setActiveTab('customers');
              }}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              onOpenPdfModal={(inv) => setSelectedInvoiceForPdf(inv)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              onOpenRecordPayment={() => {
                setPaymentPreselectedInvoice(null);
                setIsPaymentOpen(true);
              }}
              onOpenReceiptModal={(p) => setSelectedPaymentForReceipt(p)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onNavigateToInvoices={() => setActiveTab('invoices')}
              onNavigateToCustomers={() => setActiveTab('customers')}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <RegisterCustomerModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => {}}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        defaultInvoiceId={paymentPreselectedInvoice}
        onClose={() => {
          setIsPaymentOpen(false);
          setPaymentPreselectedInvoice(null);
        }}
        onSuccess={() => {}}
      />

      <CreateQuotationModal
        isOpen={isCreateQuoteOpen}
        preselectedCustomerId={quotePreselectedCustomer}
        onClose={() => {
          setIsCreateQuoteOpen(false);
          setQuotePreselectedCustomer(null);
        }}
        onSuccess={() => {}}
      />

      <QuotationPdfModal
        quotation={selectedQuotationForPdf}
        isOpen={!!selectedQuotationForPdf}
        onClose={() => setSelectedQuotationForPdf(null)}
      />

      <InvoicePdfModal
        invoice={selectedInvoiceForPdf}
        isOpen={!!selectedInvoiceForPdf}
        onClose={() => setSelectedInvoiceForPdf(null)}
        onRecordPayment={(invId) => {
          setPaymentPreselectedInvoice(invId);
          setIsPaymentOpen(true);
        }}
      />

      <ReceiptModal
        payment={selectedPaymentForReceipt}
        isOpen={!!selectedPaymentForReceipt}
        onClose={() => setSelectedPaymentForReceipt(null)}
      />

      <CustomerDetailDrawer
        customerId={drawerCustomerId}
        isOpen={!!drawerCustomerId}
        onClose={() => setDrawerCustomerId(null)}
        onCreateQuote={(custIid) => {
          setQuotePreselectedCustomer(custIid);
          setIsCreateQuoteOpen(true);
        }}
        onRecordPayment={() => {
          setPaymentPreselectedInvoice(null);
          setIsPaymentOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
