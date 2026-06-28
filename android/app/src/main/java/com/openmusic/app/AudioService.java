package com.openmusic.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.Player;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class AudioService extends Service {
    private static final String CHANNEL_ID = "open_music_playback_channel";
    private static final int NOTIFICATION_ID = 901;

    private final IBinder binder = new LocalBinder();
    private ExoPlayer player;
    private MediaSessionCompat mediaSession;
    private NotificationManager notificationManager;
    private AudioServiceListener listener;

    private String currentTitle = "Open Music";
    private String currentArtist = "未知歌手";
    private String currentCoverUrl = "";
    private Bitmap currentCoverBitmap = null;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean isTrackingProgress = false;

    public interface AudioServiceListener {
        void onTimeUpdate(long currentTimeMs, long durationMs);
        void onEnded();
        void onError(String errorMsg);
        void onStateChanged(boolean isPlaying);
    }

    public class LocalBinder extends Binder {
        AudioService getService() {
            return AudioService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();

        // Initialize ExoPlayer
        player = new ExoPlayer.Builder(this).build();
        player.setRepeatMode(Player.REPEAT_MODE_OFF);
        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_ENDED) {
                    if (listener != null) {
                        listener.onEnded();
                    }
                    stopForeground(true);
                } else if (playbackState == Player.STATE_READY) {
                    updateMediaSessionMetadata();
                    updateNotification();
                }
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                if (listener != null) {
                    listener.onStateChanged(isPlaying);
                }
                updatePlaybackState();
                if (isPlaying) {
                    startForeground(NOTIFICATION_ID, buildNotification());
                    startProgressTracker();
                } else {
                    stopForeground(false);
                    stopProgressTracker();
                    updateNotification();
                }
            }
        });

        // Initialize Media Session
        mediaSession = new MediaSessionCompat(this, "OpenMusicService");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                play();
            }

            @Override
            public void onPause() {
                pause();
            }

            @Override
            public void onSkipToNext() {
                if (listener != null) {
                    // Trigger next in web client via bridge command if needed, or through event
                    listener.onEnded(); // Simulates end to skip next
                }
            }

            @Override
            public void onSkipToPrevious() {
                // Notifier plugin triggers prev
            }
        });
        mediaSession.setActive(true);
        updatePlaybackState();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    public void setListener(AudioServiceListener listener) {
        this.listener = listener;
    }

    public void playUrl(String url) {
        MediaItem mediaItem = MediaItem.fromUri(Uri.parse(url));
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();
    }

    public void play() {
        player.play();
    }

    public void pause() {
        player.pause();
    }

    public void seek(long positionMs) {
        player.seekTo(positionMs);
    }

    public void setVolume(float volume) {
        player.setVolume(volume);
    }

    public void updateMetadata(String title, String artist, String coverUrl) {
        this.currentTitle = title != null ? title : "Open Music";
        this.currentArtist = artist != null ? artist : "未知歌手";
        
        if (coverUrl != null && !coverUrl.equals(this.currentCoverUrl)) {
            this.currentCoverUrl = coverUrl;
            loadCoverBitmap(coverUrl);
        } else {
            updateMediaSessionMetadata();
            updateNotification();
        }
    }

    private void loadCoverBitmap(final String coverUrl) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(coverUrl);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setDoInput(true);
                    connection.connect();
                    InputStream input = connection.getInputStream();
                    final Bitmap bitmap = BitmapFactory.decodeStream(input);
                    handler.post(new Runnable() {
                        @Override
                        public void run() {
                            currentCoverBitmap = bitmap;
                            updateMediaSessionMetadata();
                            updateNotification();
                        }
                    });
                } catch (Exception e) {
                    e.printStackTrace();
                    handler.post(new Runnable() {
                        @Override
                        public void run() {
                            currentCoverBitmap = null;
                            updateMediaSessionMetadata();
                            updateNotification();
                        }
                    });
                }
            }
        }).start();
    }

    private void updatePlaybackState() {
        if (mediaSession == null) return;
        
        int state = player.isPlaying() ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        long actions = PlaybackStateCompat.ACTION_PLAY | 
                       PlaybackStateCompat.ACTION_PAUSE | 
                       PlaybackStateCompat.ACTION_SKIP_TO_NEXT | 
                       PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                       PlaybackStateCompat.ACTION_SEEK_TO;
                       
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(state, player.getCurrentPosition(), 1.0f);
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void updateMediaSessionMetadata() {
        if (mediaSession == null) return;

        MediaMetadataCompat.Builder metadataBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, player.getDuration());

        if (currentCoverBitmap != null) {
            metadataBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, currentCoverBitmap);
        }

        mediaSession.setMetadata(metadataBuilder.build());
    }

    private void updateNotification() {
        if (player.isPlaying()) {
            notificationManager.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private Notification buildNotification() {
        // Pending Intent to launch MainActivity when clicking the notification
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 
                0, 
                notificationIntent, 
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        // Action Intent for Play/Pause buttons in notification
        // Note: For simplicity, actions can trigger mediaSession callbacks natively
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSmallIcon(android.R.drawable.ic_media_play) // Standard system note icon
                .setContentIntent(pendingIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setStyle(new MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0, 1))
                .setOngoing(player.isPlaying());

        if (currentCoverBitmap != null) {
            builder.setLargeIcon(currentCoverBitmap);
        }

        // Add Play/Pause control actions
        if (player.isPlaying()) {
            builder.addAction(new NotificationCompat.Action(
                    android.R.drawable.ic_media_pause, 
                    "Pause", 
                    PendingIntent.getBroadcast(this, 1, new Intent("ACTION_PAUSE"), PendingIntent.FLAG_IMMUTABLE)
            ));
        } else {
            builder.addAction(new NotificationCompat.Action(
                    android.R.drawable.ic_media_play, 
                    "Play", 
                    PendingIntent.getBroadcast(this, 2, new Intent("ACTION_PLAY"), PendingIntent.FLAG_IMMUTABLE)
            ));
        }

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Open Music Playback Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.setDescription("Controls background audio playback for Open Music");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private final Runnable progressRunnable = new Runnable() {
        @Override
        public void run() {
            if (player != null && player.isPlaying()) {
                if (listener != null) {
                    listener.onTimeUpdate(player.getCurrentPosition(), player.getDuration());
                }
                handler.postDelayed(this, 1000);
            }
        }
    };

    private void startProgressTracker() {
        if (!isTrackingProgress) {
            isTrackingProgress = true;
            handler.post(progressRunnable);
        }
    }

    private void stopProgressTracker() {
        isTrackingProgress = false;
        handler.removeCallbacks(progressRunnable);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopProgressTracker();
        if (player != null) {
            player.release();
            player = null;
        }
        if (mediaSession != null) {
            mediaSession.release();
            mediaSession = null;
        }
    }
}
