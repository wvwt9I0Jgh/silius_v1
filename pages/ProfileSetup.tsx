import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Users, MapPin, Loader2, Sparkles, AtSign, Check, ChevronRight } from 'lucide-react';
import { calculateAgeFromBirthDate, MUGLA_DISTRICT_OPTIONS } from '../lib/profileUtils';

const ProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, updateProfile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        firstName: profile?.firstName || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.firstName || '',
        lastName: profile?.lastName || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user?.user_metadata?.lastName || '',
        username: profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || '',
        birthDate: profile?.birthDate || '',
        district: profile?.district || '',
        gender: '' as string
    });

    const genderOptions = [
        { value: 'male', label: 'Erkek', emoji: '👨' },
        { value: 'female', label: 'Kadın', emoji: '👩' },
        { value: 'transgender', label: 'Transgender', emoji: '🏳️‍⚧️' },
        { value: 'lesbian', label: 'Lezbiyen', emoji: '👩‍❤️‍👩' },
        { value: 'gay', label: 'Gay', emoji: '👨‍❤️‍👨' },
        { value: 'bisexual_male', label: 'Bi (E)', emoji: '💜' },
        { value: 'bisexual_female', label: 'Bi (K)', emoji: '💗' },
        { value: 'prefer_not_to_say', label: 'Gizli', emoji: '🤐' }
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

        if (!formData.birthDate) {
            setError('Lütfen doğum tarihinizi seçin.');
            setIsLoading(false);
            return;
        }

        const calculatedAge = calculateAgeFromBirthDate(formData.birthDate);
        if (!calculatedAge || calculatedAge < 18 || calculatedAge > 30) {
            setError('Yaşınız 18-30 arasında olmalıdır.');
            setIsLoading(false);
            return;
        }

        if (!formData.district) {
            setError('Lütfen yaşadığınız ilçeyi seçin.');
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
                birthDate: formData.birthDate,
                age: calculatedAge,
                district: formData.district,
                gender: formData.gender as any,
                isProfileComplete: true
            });

            if (updateError) {
                setError('Profil güncellenemedi. Lütfen tekrar deneyin.');
                console.error('Profile update error:', updateError);
            } else {
                await refreshProfile();
                setTimeout(() => {
                    navigate('/home');
                }, 500);
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Profile setup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#030305] text-white font-sans overflow-hidden">
            {/* LEFT SIDE: Immersive Party Banner */}
            <div className={`relative w-full lg:w-[45%] xl:w-1/2 min-h-[35vh] lg:min-h-screen flex flex-col justify-end p-8 lg:p-16 overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Dynamic Backgrounds */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
                
                {/* Gradients to blend visuals */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/60 to-transparent z-10"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20 mix-blend-overlay z-10"></div>
                
                {/* Glowing Orbs */}
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-600/30 blur-[100px] rounded-full z-0 pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-cyan-600/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 text-xs font-black tracking-widest mb-6 backdrop-blur-md">
                        <Sparkles size={14} className="animate-pulse" />
                        SILIUS VIP ENTRY
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        GET ON <br className="hidden lg:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(217,70,239,0.4)]">
                            THE LIST.
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md leading-relaxed font-medium">
                        Profilini tamamla; özel etkinliklere katıl, komüniteyle tanış ve gecenin tadını çıkar.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Interactive Form */}
            <div className="relative w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-6 lg:p-12 xl:p-20 bg-[#060608] z-20 border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.6)]">
                {/* Subtle Right Side Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                <div className={`w-full max-w-xl relative z-10 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    
                    <div className="mb-10">
                        <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                            KÜNYENİ OLUŞTUR
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Ad */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-fuchsia-400 uppercase tracking-widest transition-colors ml-1">AD</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:border-fuchsia-500/50 focus:bg-zinc-800/80 focus:ring-4 focus:ring-fuchsia-500/10 transition-all outline-none placeholder:text-zinc-600"
                                        placeholder="Adın"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Soyad */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-fuchsia-400 uppercase tracking-widest transition-colors ml-1">SOYAD</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold focus:border-fuchsia-500/50 focus:bg-zinc-800/80 focus:ring-4 focus:ring-fuchsia-500/10 transition-all outline-none placeholder:text-zinc-600"
                                        placeholder="Soyadın"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Kullanıcı Adı */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-cyan-400 uppercase tracking-widest transition-colors ml-1">KULLANICI ADI</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:border-cyan-500/50 focus:bg-zinc-800/80 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none placeholder:text-zinc-600"
                                        placeholder="Benzersiz bir ad"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Doğum Tarihi */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-cyan-400 uppercase tracking-widest transition-colors ml-1 flex justify-between">
                                    <span>DOĞUM TARİHİ</span>
                                    <span className="text-zinc-600 tracking-normal">18-30</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:border-cyan-500/50 focus:bg-zinc-800/80 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none placeholder:text-zinc-600"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ilce */}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-zinc-500 group-focus-within:text-cyan-400 uppercase tracking-widest transition-colors ml-1">YAŞADIĞIN İLÇE</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <select
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:border-cyan-500/50 focus:bg-zinc-800/80 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                                    required
                                >
                                    <option value="">İlçe seç</option>
                                    {MUGLA_DISTRICT_OPTIONS.map((district) => (
                                        <option key={district.value} value={district.value}>
                                            {district.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Cinsiyet */}
                        <div className="space-y-3 pt-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={14} className="text-zinc-600" />
                                KİMLİĞİN
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {genderOptions.map((option) => {
                                    const isSelected = formData.gender === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: option.value })}
                                            className={`relative overflow-hidden rounded-2xl px-2 py-3 text-sm font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 group ${
                                                isSelected
                                                ? 'bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white shadow-[0_4px_15px_rgba(192,38,211,0.3)] transform scale-105 border-transparent'
                                                : 'bg-zinc-900/50 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10'
                                            }`}
                                        >
                                            <span className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-md' : 'grayscale-[50%] group-hover:grayscale-0'}`}>
                                                {option.emoji}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wide text-center leading-tight">
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full group overflow-hidden bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300">
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            LİSTEYE GİR
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-zinc-500 text-xs">
                        <Check size={14} className="text-zinc-600" />
                        <p>Bilgilerin sadece etkinlik listeleri ve komünite eşleşmeleri için kullanılır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;