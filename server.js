const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Vercelでの静的ファイル配信
app.use(express.static('public'));

// 新しいクライアントが接続したときの処理
io.on('connection', (socket) => {
  console.log('新しいデバイスが接続しました');

  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`デバイスがルーム「${room}」に参加しました`);
  });

  socket.on('send command', (data) => {
    io.to(data.room).emit('receive command', data.command);
    console.log(`ルーム「${data.room}」にコマンド「${data.command}」を送信しました`);
  });

  socket.on('disconnect', () => {
    console.log('デバイスが切断しました');
  });
});

// Vercelで割り当てられるポートを使用
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
