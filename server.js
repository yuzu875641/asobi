const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// ルートパスにアクセスされたときに `public/index.html` を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// `public` ディレクトリ内の静的ファイル（CSS、JSなど）を配信
app.use(express.static(path.join(__dirname, 'public')));

// クライアントからの接続イベントを監視
io.on('connection', (socket) => {
  console.log('新しいデバイスが接続しました');

  // クライアントが特定のルームに参加したとき
  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`デバイスがルーム「${room}」に参加しました`);
  });

  // クライアントがコマンドを送信したとき
  socket.on('send command', (data) => {
    // 同じルーム内の他のクライアントにコマンドを送信
    socket.to(data.room).emit('receive command', data.command);
    console.log(`ルーム「${data.room}」にコマンド「${data.command}」を送信しました`);
  });

  // クライアントが切断したとき
  socket.on('disconnect', () => {
    console.log('デバイスが切断しました');
  });
});

// Vercelが指定するポート、またはローカルのポート3000でサーバーを起動
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
