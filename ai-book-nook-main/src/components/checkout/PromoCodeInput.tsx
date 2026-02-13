import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PromoCodeInputProps {
    cartTotal: number;
    onPromoApplied: (promoData: {
        promoCodeId: string;
        code: string;
        discount: number;
        finalAmount: number;
    }) => void;
    onPromoRemoved: () => void;
    appliedPromo: {
        code: string;
        discount: number;
    } | null;
}

const PromoCodeInput = ({ cartTotal, onPromoApplied, onPromoRemoved, appliedPromo }: PromoCodeInputProps) => {
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.error('Please enter a promo code');
            return;
        }

        if (cartTotal <= 0) {
            toast.error('Cart is empty');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const { data } = await api.post(
                '/api/promo/validate',
                { code: promoCode, cartTotal },
                config
            );

            if (data.success) {
                onPromoApplied({
                    promoCodeId: data.promoCodeId,
                    code: data.code,
                    discount: data.discount,
                    finalAmount: data.finalAmount
                });
                toast.success(data.message || 'Promo code applied successfully!');
                setPromoCode('');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to apply promo code';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePromo = () => {
        onPromoRemoved();
        setPromoCode('');
        toast.success('Promo code removed');
    };

    if (appliedPromo) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="font-semibold text-green-900 dark:text-green-100">
                                {appliedPromo.code}
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Discount: ₹{appliedPromo.discount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Have a promo code?</label>
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                    disabled={loading || cartTotal <= 0}
                    className="flex-1"
                />
                <Button
                    onClick={handleApplyPromo}
                    disabled={loading || !promoCode.trim() || cartTotal <= 0}
                    className="gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        <>
                            <Tag className="h-4 w-4" />
                            Apply
                        </>
                    )}
                </Button>
            </div>
            {cartTotal <= 0 && (
                <p className="text-xs text-muted-foreground">
                    Add items to cart to apply promo code
                </p>
            )}
        </div>
    );
};

export default PromoCodeInput;
