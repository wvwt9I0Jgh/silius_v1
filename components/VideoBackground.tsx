import React, { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
    duration?: number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ duration = 20 }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => {
            video.play().catch(() => setVideoFailed(true));
        };

        const handleTimeUpdate = () => {
            if (video.currentTime >= duration) {
                video.currentTime = 0;
                video.play();
            }
        };

        const handleError = () => setVideoFailed(true);

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('error', handleError);
        };
    }, [duration]);

    if (videoFailed) {
        return (
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-slate-950 to-indigo-900/40"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(244,63,94,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)'
                }}></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={() => setVideoFailed(true)}
            >
                <source src="/laser-show.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/20 to-slate-950/50"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-indigo-500/5"></div>
        </div>
    );
};

export default VideoBackground;
