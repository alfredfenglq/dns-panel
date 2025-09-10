
import React, { useEffect, useState } from 'react';

/**
 * 复用表单（新增/编辑）
 * 字段：Type, Name, Content, TTL, Proxied
 * - 新增：record = null
 * - 编辑：record = Cloudflare 返回的记录对象
 */
export default function RecordForm({ record, onClose, onSubmit }) {
  const isEdit = Boolean(record);

  const [type, setType] = useState('A');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState(1); // 1 = Auto
  const [proxied, setProxied] = useState(false);

  useEffect(() => {
    if (record) {
      setType(record.type || 'A');
      setName(record.name || '');
      setContent(record.content || '');
      setTtl(record.ttl ?? 1);
      setProxied(Boolean(record.proxied));
    }
  }, [record]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      id: record?.id,
      type,
      name,
      content,
      ttl: Number(ttl),
      proxied,
    };
    onSubmit(payload, isEdit);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* 面板 */}
      <div className="relative w-full max-w-lg mt-24 bg-white rounded shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{isEdit ? '修改记录' : '添加新记录'}</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
          >
            关闭
          </button>
        </div>

        <form className="p-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm">Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {[
                  'A',
                  'AAAA',
                  'CNAME',
                  'TXT',
                  'MX',
                  'NS',
                  'SRV',
                  'CAA',
                  'PTR',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">TTL</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
              >
                {/* Cloudflare: 1 = Auto，其余常见值 60/120/... */}
                <option value={1}>Auto</option>
                <option value={60}>60</option>
                <option value={120}>120</option>
                <option value={300}>300</option>
                <option value={600}>600</option>
                <option value={1200}>1200</option>
                <option value={3600}>3600</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="如：www 或 @"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Content</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="如：1.2.3.4 / 目标域名 / 文本内容等"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="proxied"
              type="checkbox"
              className="h-4 w-4"
              checked={proxied}
              onChange={(e) => setProxied(e.target.checked)}
            />
            <label htmlFor="proxied" className="text-sm">
              Proxied（是否走 Cloudflare 代理）
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90"
            >
              {isEdit ? '保存修改' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
