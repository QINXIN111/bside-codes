-- Records added to the recovered production deployment during D1 preparation.
INSERT INTO codes
  (code, normalized_code, title, category, status, source, note, added_at)
SELECT
  'PDUZAK', 'PDUZAK', '夜、萤火虫和你', '流行 · 其他', 'ok', '', '',
  '2026-07-16T17:48:40.115Z'
WHERE NOT EXISTS (
  SELECT 1 FROM codes
  WHERE code = 'PDUZAK' AND added_at = '2026-07-16T17:48:40.115Z'
);

INSERT INTO codes
  (code, normalized_code, title, category, status, source, note, added_at)
SELECT
  'CQOW54', 'CQOW54', '泡沫', '流行 · 其他', 'ok', '', '',
  '2026-07-16T17:48:45.941Z'
WHERE NOT EXISTS (
  SELECT 1 FROM codes
  WHERE code = 'CQOW54' AND added_at = '2026-07-16T17:48:45.941Z'
);
