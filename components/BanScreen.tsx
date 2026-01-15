import React from 'react';
import { Ban, LogOut, AlertTriangle } from 'lucide-react';

interface BanScreenProps {
    reason: string;
    bannedAt?: string;
    onLogout: () => void;
}

const BanScreen: React.FC<BanScreenProps> = ({ reason, bannedAt, onLogout }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-8 bg-red-500/10 rounded-3xl flex items-center justify-center">
                    <Ban className="w-12 h-12 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-4">
                    HESABINIZ <span className="text-red-500">BANLANDI</span>
                </h1>

                {/* Warning Box */}
                <div className="glass-card rounded-2xl p-6 mb-6 border border-red-500/20">
                    <div className="flex items-start gap-3 text-left">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-white mb-2">Ban Nedeni:</p>
                            <p className="text-sm text-slate-300">{reason}</p>
                        </div>
                    </div>
                </div>

                {/* Ban Date */}
                {bannedAt && (
                    <p className="text-xs text-slate-500 mb-6">
                        Ban Tarihi: {new Date(bannedAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}

                {/* Info Text */}
                <p className="text-sm text-slate-400 mb-8">
                    Bu ban silinene kadar hesabınıza erişemezsiniz.
                    Eğer bunun bir hata olduğunu düşünüyorsanız, lütfen yöneticilerle iletişime geçin.
                </p>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                    <LogOut size={18} />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default BanScreen;
