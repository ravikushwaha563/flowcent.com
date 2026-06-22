import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#111827' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottom: '1pt solid #e5e7eb', paddingBottom: 20 },
    brand: { fontSize: 24, fontWeight: 'bold', color: '#111827', letterSpacing: -0.5 },
    brandSub: { fontSize: 10, color: '#6b7280', marginTop: 4 },
    invoiceTitle: { fontSize: 28, fontWeight: 'bold', color: '#6366f1', textAlign: 'right', letterSpacing: -0.5 },
    invoiceInfo: { fontSize: 10, color: '#6b7280', textAlign: 'right', marginTop: 4 },
    section: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    billTo: { width: '50%' },
    sectionLabel: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, fontWeight: 'bold' },
    clientName: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
    clientDetails: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
    dates: { width: '40%', alignItems: 'flex-end' },
    dateRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
    dateLabel: { fontSize: 10, color: '#6b7280', marginRight: 12, width: 60, textAlign: 'right' },
    dateValue: { fontSize: 10, color: '#111827', fontWeight: 'bold', width: 80, textAlign: 'right' },
    table: { width: '100%', marginBottom: 30 },
    tableHeader: { flexDirection: 'row', borderBottom: '1pt solid #e5e7eb', paddingBottom: 8, marginBottom: 8 },
    thItem: { width: '50%', fontSize: 10, color: '#6b7280', fontWeight: 'bold' },
    thQty: { width: '15%', fontSize: 10, color: '#6b7280', fontWeight: 'bold', textAlign: 'right' },
    thRate: { width: '15%', fontSize: 10, color: '#6b7280', fontWeight: 'bold', textAlign: 'right' },
    thAmount: { width: '20%', fontSize: 10, color: '#6b7280', fontWeight: 'bold', textAlign: 'right' },
    tableRow: { flexDirection: 'row', borderBottom: '1pt solid #f3f4f6', paddingVertical: 12 },
    tdItem: { width: '50%', fontSize: 10, color: '#111827' },
    tdItemDesc: { fontSize: 9, color: '#6b7280', marginTop: 4 },
    tdQty: { width: '15%', fontSize: 10, color: '#4b5563', textAlign: 'right' },
    tdRate: { width: '15%', fontSize: 10, color: '#4b5563', textAlign: 'right' },
    tdAmount: { width: '20%', fontSize: 10, color: '#111827', fontWeight: 'bold', textAlign: 'right' },
    summary: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    summaryContent: { width: '40%' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottom: '1pt solid #f3f4f6' },
    summaryLabel: { fontSize: 10, color: '#6b7280' },
    summaryValue: { fontSize: 10, color: '#111827', fontWeight: 'bold' },
    summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTop: '1pt solid #e5e7eb', marginTop: 4 },
    summaryLabelTotal: { fontSize: 12, color: '#111827', fontWeight: 'bold' },
    summaryValueTotal: { fontSize: 14, color: '#6366f1', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, borderTop: '1pt solid #e5e7eb', paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 9, color: '#9ca3af' },
});

export interface InvoicePDFProps {
    invoice: {
        invoice_number: string;
        amount: number;
        currency: string;
        due_date: string;
        created_at: string;
        status: string;
        clients: {
            name: string;
            email: string;
            company?: string;
        };
    };
    userCompany?: string;
    userName?: string;
    userEmail?: string;
}

export const InvoicePDF = ({ invoice, userCompany, userName, userEmail }: InvoicePDFProps) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(invoice.amount);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>{userCompany || 'Flowcent'}</Text>
                        <Text style={styles.brandSub}>{userName || 'Invoice'}</Text>
                        <Text style={styles.brandSub}>{userEmail || ''}</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceInfo}>{invoice.invoice_number}</Text>
                    </View>
                </View>

                {/* Bill To & Dates */}
                <View style={styles.section}>
                    <View style={styles.billTo}>
                        <Text style={styles.sectionLabel}>Billed To</Text>
                        <Text style={styles.clientName}>{invoice.clients.name}</Text>
                        {invoice.clients.company && <Text style={styles.clientDetails}>{invoice.clients.company}</Text>}
                        <Text style={styles.clientDetails}>{invoice.clients.email}</Text>
                    </View>
                    <View style={styles.dates}>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>Issue Date:</Text>
                            <Text style={styles.dateValue}>{new Date(invoice.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>Due Date:</Text>
                            <Text style={styles.dateValue}>{new Date(invoice.due_date).toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.thItem}>Description</Text>
                        <Text style={styles.thQty}>Qty</Text>
                        <Text style={styles.thRate}>Rate</Text>
                        <Text style={styles.thAmount}>Amount</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tdItem}>
                            <Text style={styles.tdItem}>Services Rendered</Text>
                            <Text style={styles.tdItemDesc}>Professional services as agreed.</Text>
                        </View>
                        <Text style={styles.tdQty}>1</Text>
                        <Text style={styles.tdRate}>{formattedAmount}</Text>
                        <Text style={styles.tdAmount}>{formattedAmount}</Text>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formattedAmount}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax (0%)</Text>
                            <Text style={styles.summaryValue}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(0)}</Text>
                        </View>
                        <View style={styles.summaryRowTotal}>
                            <Text style={styles.summaryLabelTotal}>Total Due</Text>
                            <Text style={styles.summaryValueTotal}>{formattedAmount}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business.</Text>
                    <Text style={styles.footerText}>Generated via Flowcent Platform</Text>
                </View>
            </Page>
        </Document>
    );
};
