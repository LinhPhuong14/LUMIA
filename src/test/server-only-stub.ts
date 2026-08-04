// Package `server-only` chỉ export rỗng dưới điều kiện `react-server`; ngoài
// điều kiện đó nó cố tình throw. Vitest chạy ở môi trường node nên phải alias
// sang stub này (xem vitest.config.ts) để test được module chỉ chạy trên server.
export {};
