@AGENTS.md

# CRITICAL CHANGELOG RULE 📜（更新日誌鐵律）
無論你是哪一個 AI 平台（Claude、GPT、Gemini 等）、哪一次的對話 session，或是人類開發者：
**只要修改了程式碼、修正了 Bug 或調整了樣式，就必須「立刻」在 `public/CHANGELOG.md` 最上方新增一筆版本更新紀錄！**

標準格式範例：
`### v.X.Y.Z - YYYY-MM-DD - [Emoji] [Tag] [Title]`
- Emoji 與 Tag 範例：✨ [Feature] / 🐛 [Bugfix] / 💄 [Style] / ♻️ [Refactor]
- 下方列出具體的修改細節。

# React 19 防誤關 Leaflet 彈窗心得 🗺️
在 React 19 與 Leaflet 整合時，很容易遇到「點擊彈窗內元素卻導致彈窗被誤關」的 Bubble/Propagation 問題。
**防誤關祕技**：
在使用 `onClick` 觸發事件（如打開新彈窗、切換狀態）時，必須使用 `setTimeout(..., 50)` 來延遲狀態更新，避免 React 19 的事件合成機制與 Leaflet 底層 DOM 事件衝突，導致彈出視窗被強制關閉。
切勿將這個 `setTimeout` 移除，以免破壞地圖回饋彈窗的穩定性！
