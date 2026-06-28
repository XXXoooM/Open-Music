package com.openmusic.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AudioPlayer")
public class AudioPlayerPlugin extends Plugin {
    private AudioService audioService;
    private boolean isBound = false;

    private final ServiceConnection connection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            AudioService.LocalBinder binder = (AudioService.LocalBinder) service;
            audioService = binder.getService();
            isBound = true;

            audioService.setListener(new AudioService.AudioServiceListener() {
                @Override
                public void onTimeUpdate(long currentTimeMs, long durationMs) {
                    JSObject ret = new JSObject();
                    ret.put("currentTime", currentTimeMs / 1000.0);
                    ret.put("duration", durationMs / 1000.0);
                    notifyListeners("onTimeUpdate", ret);
                }

                @Override
                public void onEnded() {
                    notifyListeners("onEnded", new JSObject());
                }

                @Override
                public void onError(String errorMsg) {
                    JSObject ret = new JSObject();
                    ret.put("message", errorMsg);
                    notifyListeners("onError", ret);
                }

                @Override
                public void onStateChanged(boolean isPlaying) {
                    JSObject ret = new JSObject();
                    ret.put("isPlaying", isPlaying);
                    notifyListeners("onStateChanged", ret);
                }
            });
        }

        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            isBound = false;
        }
    };

    @Override
    public void load() {
        super.load();
        Intent intent = new Intent(getContext(), AudioService.class);
        getContext().bindService(intent, connection, Context.BIND_AUTO_CREATE);
        getContext().startService(intent);
    }

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url");
        if (isBound && audioService != null) {
            if (url != null && !url.isEmpty()) {
                audioService.playUrl(url);
            } else {
                audioService.play();
            }
            call.resolve();
        } else {
            call.reject("AudioService not bound yet");
        }
    }

    @PluginMethod
    public void pause(PluginCall call) {
        if (isBound && audioService != null) {
            audioService.pause();
            call.resolve();
        } else {
            call.reject("AudioService not bound yet");
        }
    }

    @PluginMethod
    public void seek(PluginCall call) {
        Double time = call.getDouble("time");
        if (isBound && audioService != null && time != null) {
            audioService.seek((long) (time * 1000));
            call.resolve();
        } else {
            call.reject("Invalid seek request");
        }
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        Double volume = call.getDouble("volume");
        if (isBound && audioService != null && volume != null) {
            audioService.setVolume(volume.floatValue());
            call.resolve();
        } else {
            call.reject("Invalid volume request");
        }
    }

    @PluginMethod
    public void updateMetadata(PluginCall call) {
        String title = call.getString("title");
        String artist = call.getString("artist");
        String cover = call.getString("cover");
        if (isBound && audioService != null) {
            audioService.updateMetadata(title, artist, cover);
            call.resolve();
        } else {
            call.reject("AudioService not bound yet");
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (isBound) {
            getContext().unbindService(connection);
            isBound = false;
        }
        super.handleOnDestroy();
    }
}
