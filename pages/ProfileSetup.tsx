import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Users, ArrowRight, Loader2, Sparkles, AtSign } from 'lucide-react';

const ProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, updateProfile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Mevcut profil veya Google metadata'dan bilgileri al
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.firstName || '',
        lastName: profile?.lastName || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user?.user_metadata?.lastName || '',
        username: profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || '',
        age: '',
        gender: '' as string
    });

    const genderOptions = [
        { value: 'male', label: 'Erkek', emoji: '👨' },
        { value: 'female', label: 'Kadın', emoji: '👩' },
        { value: 'transgender', label: 'Transgender', emoji: '🏳️‍⚧️' },
        { value: 'lesbian', label: 'Lezbiyen', emoji: '👩‍❤️‍👩' },
        { value: 'gay', label: 'Gay', emoji: '👨‍❤️‍👨' },
        { value: 'bisexual_male', label: 'Biseksüel (Erkek)', emoji: '💜' },
        { value: 'bisexual_female', label: 'Biseksüel (Kadın)', emoji: '💗' },
        { value: 'prefer_not_to_say', label: 'Belirtmek İstemiyorum', emoji: '🤐' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validasyonlar
        if (!formData.firstName.trim()) {
            setError('Lütfen adınızı girin.');
            setIsLoading(false);
            return;
        }

        if (!formData.username.trim()) {
            setError('Lütfen kullanıcı adınızı girin.');
            setIsLoading(false);
            return;
        }

        if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 30) {
            setError('Yaşınız 18-30 arasında olmalıdır.');
            setIsLoading(false);
            return;
        }

        if (!formData.gender) {
            setError('Lütfen cinsiyetinizi seçin.');
            setIsLoading(false);
            return;
        }

        try {
            const { error: updateError } = await updateProfile({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                age: parseInt(formData.age),
                gender: formData.gender as any,
                isProfileComplete: true
            });

            if (updateError) {
                setError('Profil güncellenemedi. Lütfen tekrar deneyin.');
                console.error('Profile update error:', updateError);
            } else {
                await refreshProfile();
                navigate('/home');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Profile setup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[var(--bg-deep)] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-xl relative z-10">
                <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 border-2 border-emerald-500/20">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                            <Sparkles size={36} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black font-outfit mb-3 tracking-tighter uppercase leading-none">
                            PROFİLİNİ TAMAMLA
                        </h2>
                        <p className="text-sm opacity-60">
                            Silius topluluğuna katılmak için birkaç bilgi daha lazım
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center bg-rose-500/10 text-rose-500">
                                {error}
                            </div>
                        )}

                        {/* Ad Soyad */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">AD</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-emerald-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full glass rounded-2xl pl-14 pr-6 py-4 text-sm font-semibold focus:border-emerald-500 outline-none"
                                        placeholder="Adınız"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">SOYAD</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full glass rounded-2xl px-6 py-4 text-sm font-semibold focus:border-emerald-500 outline-none"
                                    placeholder="Soyadınız"
                                />
                            </div>
                        </div>

                        {/* Kullanıcı Adı */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">KULLANICI ADI</label>
                            <div className="relative">
                                <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-emerald-500" size={18} />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full glass rounded-2xl pl-14 pr-6 py-4 text-sm font-semibold focus:border-emerald-500 outline-none"
                                    placeholder="Kullanıcı adınız"
                                    required
                                />
                            </div>
                        </div>

                        {/* Yaş */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">YAŞ</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-emerald-500" size={18} />
                                <input
                                    type="number"
                                    min="18"
                                    max="30"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full glass rounded-2xl pl-14 pr-6 py-4 text-sm font-semibold focus:border-emerald-500 outline-none"
                                    placeholder="Yaşınız (18+)"
                                    required
                                />
                            </div>
                            <p className="text-[10px] opacity-40 ml-1">18 yaşından küçükler kayıt olamaz</p>
                        </div>

                        {/* Cinsiyet */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={14} />
                                CİNSİYET
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {genderOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: option.value })}
                                        className={`glass rounded-2xl px-4 py-4 text-sm font-semibold transition-all flex items-center gap-3 ${formData.gender === option.value
                                            ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                            : 'border border-white/10 hover:border-emerald-500/50'
                                            }`}
                                    >
                                        <span className="text-xl">{option.emoji}</span>
                                        <span className="text-xs">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    DEVAM ET
                                    <ArrowRight size={22} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs opacity-40 mt-6">
                        Bu bilgiler profilinde görünecek ve istediğin zaman değiştirebilirsin
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
