# シカクマスター / ShikakuMaster

日商簿記2級（商業簿記・工業簿記）・3級の合格を目指すモバイルファースト学習＆模擬テストWebアプリです。
**プラグイン型の拡張プラットフォーム設計**を採用しており、今後 **中小企業診断士** など他の国家資格・検定コースをコアUIを書き換えることなく追加できます。

## 主な機能

- **マルチ資格切替**: ヘッダーの資格スイッチャーから「日商簿記 2級・3級（公開中）」と「中小企業診断士 1次試験（拡張プレビュー）」を切替可能
- **スキマ学習 (`/study`)**: 仕訳入力（借方・貸方）および選択式問題、勘定分解・ボックス図・計算式・表などの合成可能な解説ブロック（`ExplanationBlock`）
- **模擬テスト (`/mock-exam`)**: 制限時間タイマー・大問別配点・合否判定・弱点復習連携
- **リファレンス辞典 (`/dictionary`)**: 日商簿記では「勘定科目辞典」、中小企業診断士では「経営・財務用語辞典」として共通UIで機能
- **学習成績 (`/stats`)**: 資格別・科目（トラック）別・分野別の習得率、連続学習日数、デイリー目標、弱点問題キュー
- **資格専用ツール（簿記電卓）**: `tools: ['calculator']` を宣言した資格でのみ表示される、`00`・メモリ（`M+/M-/MR/MC`）・計算履歴テープ付き電卓

## ディレクトリ構成

```text
src/
├── types/
│   ├── exam.ts             # プラットフォーム共通の型定義（ExamPlugin, Question, ExplanationBlock等）
│   └── boki.ts             # exam.tsの再エクスポート＋簿記向け型エイリアス
├── exams/
│   ├── registry.ts         # 全資格プラグインの中央レジストリ＆検索ヘルパー
│   ├── boki/               # 日商簿記プラグイン（3級・2級商業・2級工業・科目辞典・模試）
│   └── shindanshi/         # 中小企業診断士プラグイン（1次試験7科目の拡張ブループリント）
├── lib/
│   ├── constants.ts        # 5要素・トラックカラー・円表示フォーマット・仕訳採点ロジック
│   └── storage.ts          # マルチ資格対応の進捗ストア（localStorage + React Context）
├── components/
│   ├── layout/AppShell.tsx # 資格スイッチャー付きヘッダー・モバイル下部ナビ・電卓制御
│   └── ui/                 # CalculatorModal, ProgressRing, ElementBadge, TrackBadge等
└── app/                    # Next.js App Router ページ群
```

## 新しい試験の追加方法

コアアプリ（`src/app/*`, `src/lib/storage.ts`, `AppShell.tsx`）を変更せず、以下の3ステップで新しい資格コースを追加できます。

1. **プラグインフォルダを作成**: `src/exams/<exam-id>/index.ts` を作成し、`ExamPlugin` 型のオブジェクトをエクスポートします。
   - `tracks`: 科目や級（例：中小企業診断士の1次試験7科目）を定義
   - `tools`: 必要な試験専用ツール（例：`['calculator']` または `[]`）を宣言
   - `questions`: `examId` / `trackId` を付与した問題配列を登録。解説には `extraBlocks` を使って計算式（`formula`）、比較表（`table`）、ボックス図（`box-diagram`）、ポイント枠（`callout`）を自由に合成可能
   - `references`: 辞典データ（`ReferenceItem[]`）を登録
   - `mockExams`: 模擬テスト定義（`MockExam[]`）を登録
2. **レジストリに登録**: `src/exams/registry.ts` の `EXAM_REGISTRY` 配列に作成したプラグインを追加します。
3. **公開状態を設定**: 準備が整ったら `status: 'active'` に変更するだけで、ヘッダーの資格スイッチャー・学習画面・模擬テスト・辞典・成績集計に自動反映されます。

## 開発コマンド

```bash
npm install
npm run dev
npm run typecheck
npm run build
```
