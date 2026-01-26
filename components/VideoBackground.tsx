import React, { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
    duration?: number; // Saniye cinsinden oynatma süresi
}

/**
 * Video arka plan bileşeni
 * Lazer show videosunu arka planda oynatır
 * @param duration - Video oynatma süresi (varsayılan: 20 saniye)
 */
const VideoBackground: React.FC<VideoBackgroundProps> = ({ duration = 20 }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Video yüklendiğinde başlat
        const handleLoadedData = () => {
            video.play().catch(err => console.log('Video autoplay blocked:', err));
        };

        // Belirtilen süreye ulaşınca başa sar (döngü)
        const handleTimeUpdate = () => {
            if (video.currentTime >= duration) {
                video.currentTime = 0; // Başa sar
                video.play(); // Tekrar oynat
            }
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [duration]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
            >
                <source src="/laser-show.mp4" type="video/mp4" />
            </video>
            {/* Gradient Overlay - çok hafif, video görünsün */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/20 to-slate-950/50"></div>
            {/* Renk aksan overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-indigo-500/5"></div>
        </div>
    );
};

export default VideoBackground;
