
import React, { useEffect, useMemo, useState } from 'react';
import { api, getErrMsg } from './api';
import RecordForm from './components/RecordForm';

export default function App() {
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null = create
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 获取 Zones
  useEffect(() => {
    (async () => {
      try {
        setError('');
        setIsLoadingZones(true);
        const { data } = await api.get('/api/zones');
        const list = data?.result || [];
        setZones(list);
        if (list.length && !selectedZoneId) {
          setSelectedZoneId(list[0].id);
        }
      } catch (err) {
        setError(getErrMsg(err));
      } finally {
        setIsLoadingZones(false);
      }
    })();
  }, []);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );

  const recordTypes = useMemo(
    () => Array.from(new Set(dnsRecords.map((r) => r.type))),
    [dnsRecords]
  );

  const filteredRecords = useMemo(() => {
    const byType =
      filterType === 'all'
        ? dnsRecords
        : dnsRecords.filter((r) => r.type === filterType);

    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return byType;

    return byType.filter((r) =>
      (r?.name || '').toLowerCase().includes(keyword)
    );
  }, [dnsRecords, filterType, searchTerm]);

  // 获取选中 Zone 的 DNS 记录
  async function loadDnsRecords(zoneId) {
    if (!zoneId) return;
    try {
      setError('');
      setIsLoadingRecords(true);
      const { data } = await api.get(`/api/zones/${zoneId}/dns_records`);
      setDnsRecords(data?.result || []);
    } catch (err) {
      setError(getErrMsg(err));
    } finally {
      setIsLoadingRecords(false);
    }
  }

  useEffect(() => {
    if (selectedZoneId) {
      loadDnsRecords(selectedZoneId);
    }
  }, [selectedZoneId]);

  useEffect(() => {
    setSearchTerm('');
  }, [selectedZoneId]);

  useEffect(() => {
    if (filterType === 'all') return;

    const hasFilterType = dnsRecords.some((r) => r.type === filterType);
    if (!hasFilterType) {
      setFilterType('all');
    }
  }, [dnsRecords, filterType]);

  // 删除
  async function handleDelete(record) {
    if (!selectedZoneId || !record?.id) return;
    const ok = window.confirm(
      `确认要删除记录：${record.type} ${record.name} -> ${record.content} ?`
    );
    if (!ok) return;
    try {
      setError('');
      await api.delete(
        `/api/zones/${selectedZoneId}/dns_records/${record.id}`
      );
      await loadDnsRecords(selectedZoneId);
    } catch (err) {
      setError(getErrMsg(err));
    }
  }

  // 打开创建
  function openCreate() {
    setEditingRecord(null);
    setFormOpen(true);
  }

  // 打开编辑
  function openEdit(record) {
    setEditingRecord(record);
    setFormOpen(true);
  }

  // 提交表单（新增或修改）
  async function submitRecord(values, isEdit) {
    try {
      setError('');
      if (isEdit) {
        await api.put(
          `/api/zones/${selectedZoneId}/dns_records/${values.id}`,
          {
            type: values.type,
            name: values.name,
            content: values.content,
            ttl: values.ttl,
            proxied: values.proxied,
          }
        );
      } else {
        await api.post(`/api/zones/${selectedZoneId}/dns_records`, {
          type: values.type,
          name: values.name,
          content: values.content,
          ttl: values.ttl,
          proxied: values.proxied,
        });
      }
      setFormOpen(false);
      await loadDnsRecords(selectedZoneId);
    } catch (err) {
      setError(getErrMsg(err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Cloudflare DNS 解析记录管理</h1>
        <p className="text-gray-600">
          通过 Pages Functions 安全代理 Cloudflare API（Token 仅存放在后端）
        </p>
      </header>

      {/* Zone 选择 */}
      <section className="mb-6">
        <label className="block mb-2 text-sm font-medium">选择域名（Zone）：</label>
        <div className="flex items-center gap-3">
          <select
            className="w-full md:w-96 border rounded px-3 py-2"
            disabled={isLoadingZones}
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.id})
              </option>
            ))}
          </select>

          <button
            className="px-3 py-2 border rounded hover:bg-gray-100"
            onClick={() => selectedZoneId && loadDnsRecords(selectedZoneId)}
            disabled={!selectedZoneId || isLoadingRecords}
            title="刷新当前 Zone 的记录"
          >
            刷新
          </button>

          <button
            className="px-3 py-2 bg-blue-600 text-white rounded hover:opacity-90"
            onClick={openCreate}
            disabled={!selectedZoneId}
          >
            添加新记录
          </button>
        </div>
        {isLoadingZones && <p className="text-sm text-gray-500 mt-2">正在加载域名列表…</p>}
      </section>

      {/* 错误提示 */}
      {!!error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 记录表格 */}
      <section className="bg-white shadow-sm border rounded">
        <div className="p-3 border-b md:flex md:items-center md:justify-between md:gap-4">
          <div>
            <h2 className="font-semibold">
              DNS 记录（{selectedZone?.name || '-'}）
            </h2>
            {isLoadingRecords && (
              <p className="text-sm text-gray-500">正在加载解析记录…</p>
            )}
          </div>
          <div className="mt-3 md:mt-0 flex flex-col gap-3 md:flex-row md:items-center">
            {!!recordTypes.length && (
              <div className="flex items-center gap-2">
                <label className="text-sm" htmlFor="record-type-filter">
                  筛选类型：
                </label>
                <select
                  id="record-type-filter"
                  className="border rounded px-2 py-1 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">全部</option>
                  {recordTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label
                className="text-sm whitespace-nowrap"
                htmlFor="domain-search"
              >
                搜索域名：
              </label>
              <input
                id="domain-search"
                type="search"
                className="border rounded px-2 py-1 text-sm"
                placeholder="输入域名关键字"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Content</th>
                <th className="text-left p-3">Proxied</th>
                <th className="text-left p-3">TTL</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">{r.type}</td>
                  <td className="p-3 break-all">{r.name}</td>
                  <td className="p-3 break-all">{r.content}</td>
                  <td className="p-3">{String(r.proxied)}</td>
                  <td className="p-3">{r.ttl}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => openEdit(r)}
                      >
                        修改
                      </button>
                      <button
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDelete(r)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredRecords.length && !isLoadingRecords && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    暂无记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 表单模态框 */}
      {formOpen && (
        <RecordForm
          onClose={() => setFormOpen(false)}
          onSubmit={submitRecord}
          record={editingRecord}
        />
      )}

      <footer className="text-xs text-gray-400 mt-6">
        接口：GET/POST/PUT/DELETE /api/zones/:zoneId/dns_records
      </footer>
    </div>
  );
}
