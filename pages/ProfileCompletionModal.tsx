import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../database';
import { User, Calendar, Heart, Loader2, Sparkles } from 'lucide-react';

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onComplete }) => {
    const { user, refreshProfile } = useAuth();
    const [gender, setGender] = useState<string>('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const calculateAge = (birthdate: string): number => {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!gender) {
            setError('Lütfen cinsiyetinizi seçin');
            return;
        }
        
        if (!birthdate) {
            setError('Lütfen doğum tarihinizi girin');
            return;
        }

        const age = calculateAge(birthdate);
        
        if (age < 13) {
            setError('Platformu kullanmak için en az 13 yaşında olmalısınız');
            return;
        }

        if (age > 120) {
            setError('Geçerli bir doğum tarihi girin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await db.updateUserProfile(user?.id!, {
                gender,
                birthdate,
                age,
                profile_completed: true
            });
            
            await refreshProfile?.();
            onComplete();
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Bir hata oluştu, lütfen tekrar deneyin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            
            {/* Modal */}
            <div className="relative w-full max-w-md glass-card rounded-3xl p-8 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">
                        Profilini <span className="text-violet-500">Tamamla</span>
                    </h2>
                    <p className="text-sm opacity-60 mt-2">
                        Seni daha iyi tanıyalım!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Gender Selection */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                            <User size={12} className="inline mr-2" />
                            Cinsiyet
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'male', label: 'Erkek', emoji: '👨' },
                                { value: 'female', label: 'Kadın', emoji: '👩' },
                                { value: 'other', label: 'Diğer', emoji: '🧑' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setGender(option.value)}
                                    className={`p-4 rounded-2xl text-center transition-all ${
                                        gender === option.value
                                            ? 'bg-violet-500 text-white scale-105'
                                            : 'glass hover:bg-violet-500/10'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{option.emoji}</span>
                                    <span className="text-xs font-bold">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Birthdate */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                            <Calendar size={12} className="inline mr-2" />
                            Doğum Tarihi
                        </label>
                        <input
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-4 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent"
                        />
                        {birthdate && (
                            <p className="text-xs mt-2 text-violet-400">
                                🎂 {calculateAge(birthdate)} yaşındasınız
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !gender || !birthdate}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Heart size={18} />
                                Tamamla
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;