
import axios from 'axios';

// 同源部署：相对路径命中 Pages Functions 的 /api/* 路由
export const api = axios.create({
  baseURL: '',
  timeout: 20000,
});

export function getErrMsg(err) {
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.message).join('; ');
  }
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return 'Unknown error';
}
