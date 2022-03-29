const { Pool } = require('pg');
const NotFoundError = require('./NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylist(playlistId) {
    const songs = [];

    const playlist = await this.isPlaylistExist(playlistId);

    const queryPlaylistSongs = {
      text: 'SELECT song_id FROM playlist_songs WHERE playlist_id = $1',
      values: [playlistId],
    };

    const playlistSongs = await this._pool.query(queryPlaylistSongs);

    await Promise.all(playlistSongs.rows.map(async (row) => {
      const querySongs = {
        text: 'SELECT id, title, performer FROM songs WHERE id = $1',
        values: [row.song_id],
      };

      const result = await this._pool.query(querySongs);
      songs.push(result.rows[0]);
    }));

    const { id, name } = playlist.rows[0];
    const composedPlaylist = {
      id, name, songs,
    };

    return composedPlaylist;
  }

  async isPlaylistExist(playlistId) {
    const queryPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return resultPlaylist;
  }
}

module.exports = PlaylistsService;
