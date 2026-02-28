import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { Zap, Loader2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

const MyQR: React.FC = () => {
    const { user } = useAuth();
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const allEvents = await db.getEvents();
                const userEvents = allEvents.filter(e => e.user_id === user.id);
                setMyEvents(userEvents);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        loadEvents();
    }, [user]);

    if (isLoading) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-slate-950">
                 <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-24 px-4 max-w-2xl mx-auto">
             <div className="glass-card rounded-[2.5rem] p-8 md:p-12 text-center animate-scale-in">
                <div className="w-20 h-20 bg-rose-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-rose-500/30 mb-6">
                    <QrCode size={40} className="text-white" />
                </div>
                
                <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter mb-2">QR Kodlarım</h1>
                <p className="opacity-60 mb-10 leading-relaxed">
                    Etkinliklerine gelen katılımcılar bu kodları okutarak check-in yapabilirler.
                </p>

                {myEvents.length > 0 ? (
                    <div className="space-y-12">
                        {myEvents.map(event => (
                            <div key={event.id} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl relative">
                                    <div className="flex justify-center mb-6">
                                        <QRCode 
                                            value={`https://${window.location.host}/#/checkin/${event.id}`} 
                                            size={220} 
                                            level="H"
                                            className="h-auto max-w-full"
                                        />
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{event.title}</h3>
                                    
                                    <div className="flex justify-center gap-2">
                                        <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-500 font-bold border border-slate-200">
                                            ID: {event.id.slice(0, 8)}
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Aktif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                        <Zap size={48} className="mx-auto text-indigo-500/50 mb-4" />
                        <p className="text-lg font-bold mb-4">Henüz aktif bir etkinliğin yok.</p>
                        <Link 
                            to="/vibeler" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition w-auto"
                        >
                            <Zap size={18} /> Vibe Oluştur
                        </Link>
                    </div>
                )}
             </div>
        </div>
    );
};

export default MyQR;
