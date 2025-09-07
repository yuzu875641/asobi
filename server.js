const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// ルートパスにアクセスされたときに `public/index.html` を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// `public` ディレクトリ内の静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

// クライアントからの接続イベントを監視
io.on('connection', (socket) => {
  console.log('新しいデバイスが接続しました');

  // クライアントが特定のルームに参加したとき
  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`デバイスがルーム「${room}」に参加しました`);
    // ルームに参加したことを他のユーザーに通知
    socket.to(room).emit('user joined', { id: socket.id });
  });

  // 連携操作用のコマンドを受信したとき
  socket.on('send command', (data) => {
    // 同じルーム内の他のクライアントにコマンドを送信
    socket.to(data.room).emit('receive command', data.command);
    console.log(`ルーム「${data.room}」にコマンド「${data.command}」を送信しました`);
  });

  // WebRTCのシグナリング関連イベント
  // オファーを受信し、同じルーム内の他のクライアントに転送
  socket.on('send offer', (data) => {
    socket.to(data.room).emit('receive offer', { offer: data.offer });
  });

  // アンサーを受信し、同じルーム内の他のクライアントに転送
  socket.on('send answer', (data) => {
    socket.to(data.room).emit('receive answer', { answer: data.answer });
  });

  // ICE候補を受信し、同じルーム内の他のクライアントに転送
  socket.on('send candidate', (data) => {
    socket.to(data.room).emit('receive candidate', { candidate: data.candidate });
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
