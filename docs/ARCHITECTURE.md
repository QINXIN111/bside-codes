# BSide 分享码网站架构

## 当前结构

- `public/index.html`：从稳定生产部署恢复的完整前端。
- `functions/api/`：Cloudflare Pages Functions API。
- `migrations/`：D1 数据库结构和经过校验的初始数据。
- `data/`：事故恢复时导出的只读 JSON 快照。
- `backup/`：历史和灾难恢复备份。
- `backup-worker/`：每天将正式 D1 全量快照写入独立 KV 存储的 Worker。
- `.github/workflows/`：每次提交的数据校验，以及只能手动触发的生产发布。

## 数据原则

- D1 是正式数据源。
- GitHub JSON 和本地导出是异地灾备，不再作为线上唯一数据库。
- 切换前确认的 322 条数据原样保留，包括一组仅大小写不同的重复分享码。
- 新增或编辑分享码时，按大写标准化代码查找并更新最新记录，防止新增重复。

## 发布门禁

生产发布前必须满足：

1. `/api/health` 返回 HTTP 200。
2. D1 分享码不少于 322 条。
3. 讨论主题不少于 10 条。
4. 预览部署完成读接口和隔离写入测试。
5. 保留可立即回滚的上一个生产部署。

## 灾备策略

- D1 Time Travel 提供短期时间点恢复。
- KV 命名空间 `bside-sharecode-backups` 每天香港时间 02:15 保存一份 JSON 全量快照，并维护 `latest.json`。
- GitHub 保留恢复基线、SQL 导出、数据库迁移和可审计的历史记录。
- Cloudflare Pages 的 Git 自动生产部署保持关闭；生产发布只允许人工确认后执行。
