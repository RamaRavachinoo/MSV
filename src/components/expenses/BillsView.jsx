import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { differenceInCalendarDays } from 'date-fns';
import { Receipt } from 'lucide-react';
import BillCard from './BillCard';
import CreateBillModal from './CreateBillModal';
import ConfirmModal from '../ui/ConfirmModal';
import { currentPeriod, dueDateThisMonth } from '../../lib/bills';

const BillsView = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [deleteConfirmBill, setDeleteConfirmBill] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [billsRes, paymentsRes] = await Promise.all([
                supabase.from('home_bills').select('*').eq('is_active', true).order('due_day', { ascending: true }),
                supabase.from('home_bill_payments').select('*').eq('period', currentPeriod()),
            ]);
            if (billsRes.error) throw billsRes.error;
            if (paymentsRes.error) throw paymentsRes.error;
            setBills(billsRes.data || []);
            setPayments(paymentsRes.data || []);
        } catch (e) {
            console.error('Error fetching bills:', e);
        } finally {
            setLoading(false);
        }
    };

    const enrichedBills = useMemo(() => {
        return bills
            .map(bill => {
                const payment = payments.find(p => p.bill_id === bill.id);
                const daysUntil = differenceInCalendarDays(dueDateThisMonth(bill.due_day), new Date());
                return { bill, isPaid: !!payment, daysUntil };
            })
            .sort((a, b) => {
                if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
                return a.daysUntil - b.daysUntil;
            });
    }, [bills, payments]);

    const monthlyTotal = useMemo(
        () => bills.reduce((sum, b) => sum + Number(b.amount || 0), 0),
        [bills]
    );
    const paidTotal = useMemo(() => {
        return bills
            .filter(b => payments.some(p => p.bill_id === b.id))
            .reduce((sum, b) => sum + Number(b.amount || 0), 0);
    }, [bills, payments]);

    const togglePaid = async (bill, isPaid) => {
        try {
            if (isPaid) {
                const { error } = await supabase
                    .from('home_bill_payments')
                    .delete()
                    .eq('bill_id', bill.id)
                    .eq('period', currentPeriod());
                if (error) throw error;
            } else {
                const { error } = await supabase.from('home_bill_payments').insert([{
                    bill_id: bill.id,
                    period: currentPeriod(),
                    paid_by: user?.id,
                    amount_paid: bill.amount,
                }]);
                if (error) throw error;
            }
            fetchData();
        } catch (e) {
            console.error('Error toggling payment:', e);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmBill) return;
        try {
            const { error } = await supabase.from('home_bills').delete().eq('id', deleteConfirmBill.id);
            if (error) throw error;
            setBills(prev => prev.filter(b => b.id !== deleteConfirmBill.id));
            setDeleteConfirmBill(null);
        } catch (e) {
            console.error('Error deleting bill:', e);
        }
    };

    const openEdit = (bill) => { setEditingBill(bill); setIsModalOpen(true); };
    const openNew = () => { setEditingBill(null); setIsModalOpen(true); };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-24"
        >
            {/* Monthly summary */}
            <div className="bg-gradient-to-r from-romantic-500 to-romantic-600 p-6 rounded-3xl text-white shadow-lg shadow-romantic-200">
                <span className="text-romantic-100 text-sm font-medium">Cuentas fijas del mes</span>
                <div className="text-4xl font-bold mt-1 mb-4">${monthlyTotal.toLocaleString()}</div>
                {monthlyTotal > 0 && (
                    <>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/90 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((paidTotal / monthlyTotal) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-romantic-100">
                            <span>Pagado: ${paidTotal.toLocaleString()}</span>
                            <span>{Math.round((paidTotal / monthlyTotal) * 100)}%</span>
                        </div>
                    </>
                )}
            </div>

            {/* Header / Create Button */}
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-serif text-gray-800">Cuentas Fijas</h2>
                <button
                    onClick={openNew}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                >
                    + Nueva Cuenta
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : enrichedBills.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-8">
                        <Receipt size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400 mb-4">No hay cuentas fijas cargadas.</p>
                        <button onClick={openNew} className="text-romantic-500 font-bold hover:underline">
                            Agreguen el alquiler o las expensas
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        {enrichedBills.map(({ bill, isPaid, daysUntil }) => (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <BillCard
                                    bill={bill}
                                    isPaid={isPaid}
                                    daysUntil={daysUntil}
                                    onTogglePaid={() => togglePaid(bill, isPaid)}
                                    onEdit={openEdit}
                                    onDelete={setDeleteConfirmBill}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingBill(null); }}
                onSuccess={fetchData}
                editingBill={editingBill}
            />

            <ConfirmModal
                isOpen={!!deleteConfirmBill}
                onClose={() => setDeleteConfirmBill(null)}
                onConfirm={handleDelete}
                title="¿Eliminar esta cuenta?"
                message={`Se eliminará "${deleteConfirmBill?.title}" y su historial de pagos.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </motion.div>
    );
};

export default BillsView;
