import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Plus, LogOut, Trash2, User, Upload } from 'lucide-react';

// Configuration Firebase - À REMPLACER avec vos identifiants
const FIREBASE_CONFIG = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const ADMIN_EMAIL = "franckngaphap@gmail.com"; // Votre email admin

export default function MusicStreamApp() {
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef(null);
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Simuler Firebase (remplacer par vraie connexion Firebase)
  useEffect(() => {
    // Charger utilisateur du localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Charger albums du localStorage
    const savedAlbums = localStorage.getItem('albums');
    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums));
    }
    
    setLoading(false);
  }, []);

  // Sauvegarder albums dans localStorage
  useEffect(() => {
    if (albums.length > 0) {
      localStorage.setItem('albums', JSON.stringify(albums));
    }
  }, [albums]);

  // Gestion audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrack?.nextTrack) {
        playTrack(currentTrack.nextTrack);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const signInWithGoogle = () => {
    // Simulation - Remplacer par vraie auth Google
    const mockUser = {
      email: prompt('Entrez votre email pour tester:') || 'user@example.com',
      displayName: 'Utilisateur Test',
      photoURL: 'https://via.placeholder.com/100'
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentTrack(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playAlbum = (album) => {
    if (album.tracks && album.tracks.length > 0) {
      playTrack({
        ...album.tracks[0],
        albumTitle: album.title,
        albumCover: album.coverUrl,
        artist: album.artist,
        trackIndex: 0,
        totalTracks: album.tracks.length,
        album: album
      });
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const skipToNext = () => {
    if (!currentTrack?.album) return;
    const nextIndex = currentTrack.trackIndex + 1;
    if (nextIndex < currentTrack.totalTracks) {
      playTrack({
        ...currentTrack.album.tracks[nextIndex],
        albumTitle: currentTrack.albumTitle,
        albumCover: currentTrack.albumCover,
        artist: currentTrack.artist,
        trackIndex: nextIndex,
        totalTracks: currentTrack.totalTracks,
        album: currentTrack.album
      });
    }
  };

  const skipToPrevious = () => {
    if (!currentTrack?.album) return;
    const prevIndex = currentTrack.trackIndex - 1;
    if (prevIndex >= 0) {
      playTrack({
        ...currentTrack.album.tracks[prevIndex],
        albumTitle: currentTrack.albumTitle,
        albumCover: currentTrack.albumCover,
        artist: currentTrack.artist,
        trackIndex: prevIndex,
        totalTracks: currentTrack.totalTracks,
        album: currentTrack.album
      });
    }
  };

  const seekTo = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const deleteAlbum = (albumId) => {
    if (confirm('Supprimer cet album ?')) {
      setAlbums(albums.filter(a => a.id !== albumId));
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="w-20 h-20 text-purple-400 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-white mb-3">Music Stream</h1>
          <p className="text-gray-400 text-lg mb-8">Vos albums, partout, tout le temps</p>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition flex items-center gap-2 mx-auto"
          >
            <User className="w-5 h-5" />
            Se connecter (Demo)
          </button>
          <p className="text-gray-500 text-sm mt-4">
            En production: Connexion avec Google
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black text-white">
      <audio ref={audioRef} src={currentTrack?.url} />
      
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold">Music Stream</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Ajouter un album
              </button>
            )}
            <div className="flex items-center gap-3">
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
              <button
                onClick={signOut}
                className="hover:text-purple-400 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        <h2 className="text-3xl font-bold mb-6">
          {isAdmin ? 'Ma Bibliothèque' : 'Albums Disponibles'}
        </h2>
        
        {albums.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun album pour le moment</p>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Ajouter votre premier album
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group bg-white/5 hover:bg-white/10 p-4 rounded-lg transition cursor-pointer backdrop-blur-sm"
                onClick={() => playAlbum(album)}
              >
                <div className="relative mb-4">
                  <img
                    src={album.coverUrl || 'https://via.placeholder.com/300?text=Album'}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                    <Play className="w-16 h-16 text-white" fill="white" />
                  </div>
                </div>
                <h3 className="font-bold truncate mb-1">{album.title}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                <p className="text-xs text-gray-500 mt-1">{album.tracks?.length || 0} pistes</p>
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAlbum(album.id);
                    }}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Progress bar */}
            <div
              className="h-1 bg-white/20 rounded-full mb-4 cursor-pointer"
              onClick={seekTo}
            >
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              {/* Track info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={currentTrack.albumCover}
                  alt=""
                  className="w-16 h-16 rounded-lg shadow-lg"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={skipToPrevious}
                  disabled={!currentTrack?.album || currentTrack.trackIndex === 0}
                  className="hover:text-purple-400 transition disabled:opacity-30"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="bg-white text-black rounded-full p-3 hover:scale-110 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="black" />
                  ) : (
                    <Play className="w-6 h-6" fill="black" />
                  )}
                </button>
                
                <button
                  onClick={skipToNext}
                  disabled={!currentTrack?.album || currentTrack.trackIndex >= currentTrack.totalTracks - 1}
                  className="hover:text-purple-400 transition disabled:opacity-30"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Time */}
              <div className="text-sm text-gray-400 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Album Modal */}
      {showAddModal && (
        <AddAlbumModal
          onClose={() => setShowAddModal(false)}
          onSave={(newAlbum) => {
            setAlbums([...albums, { ...newAlbum, id: Date.now().toString() }]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddAlbumModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [year, setYear] = useState('');
  const [tracks, setTracks] = useState([{ title: '', url: '', duration: '' }]);

  const addTrack = () => {
    setTracks([...tracks, { title: '', url: '', duration: '' }]);
  };

  const updateTrack = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  const removeTrack = (index) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title || !artist || tracks.filter(t => t.title && t.url).length === 0) {
      alert('Veuillez remplir au moins le titre, l\'artiste et une piste');
      return;
    }

    onSave({
      title,
      artist,
      coverUrl: coverUrl || 'https://via.placeholder.com/300?text=Album',
      year: parseInt(year) || new Date().getFullYear(),
      tracks: tracks.filter(t => t.title && t.url),
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Ajouter un Album</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Titre de l'album *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            
            <input
              type="text"
              placeholder="Artiste *"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            
            <input
              type="text"
              placeholder="URL de la couverture (Archive.org ou autre)"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            
            <input
              type="number"
              placeholder="Année"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />

            <div className="pt-4">
              <h3 className="text-lg font-bold mb-4">Pistes</h3>
              {tracks.map((track, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold text-lg">{index + 1}</span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Titre de la piste *"
                        value={track.title}
                        onChange={(e) => updateTrack(index, 'title', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="URL Archive.org *"
                        value={track.url}
                        onChange={(e) => updateTrack(index, 'url', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Durée (ex: 3:45)"
                        value={track.duration}
                        onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    {tracks.length > 1 && (
                      <button
                        onClick={() => removeTrack(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={addTrack}
                className="w-full border-2 border-dashed border-white/20 rounded-lg py-3 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter une piste
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
