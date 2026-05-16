# NExT Event Timetable — WordPress Plugin 仕様書

**プラグイン名** : NExT Event Timeline  
**スラッグ** : next-event-timetable  
**ビルドツール** : @wordpress/scripts（JSX / ES Modules）

---

## ディレクトリ構成

```
NExT-Event-Timeline/
├── next-event-timetable.php     # メインプラグインファイル
├── includes/
│   ├── post-types.php           # CPT 登録
│   ├── taxonomies.php           # タクソノミー登録
│   └── meta-fields.php          # メタフィールド登録 + REST API 公開
├── src/
│   ├── timetable/               # 親ブロック
│   │   ├── block.json
│   │   ├── edit.js
│   │   ├── save.js
│   │   ├── index.js
│   │   └── style.css
│   ├── track/                   # 子ブロック
│   │   ├── block.json
│   │   ├── edit.js
│   │   ├── save.js
│   │   └── index.js
│   └── card/                    # 孫ブロック
│       ├── block.json
│       ├── edit.js
│       ├── save.js
│       └── index.js
├── build/                       # @wordpress/scripts ビルド出力
├── package.json
└── SPEC.md
```

---

## カスタムポストタイプ

**スラッグ** : `next_event_session`

| フィールド | 内容 |
|-----------|------|
| タイトル | セッション名 |
| `_session_start_time` | 開始時刻（HH:MM） |
| `_session_end_time` | 終了時刻（HH:MM） |
| `_session_type` | 種別（`talk` / `workshop` / `break` / `keynote`） |
| `_session_speakers` | 登壇者（JSON 配列。プラグイン内装で管理） |

### 登壇者フィールド構造（`_session_speakers` の1要素）

```json
{
  "name": "氏名",
  "photo": 123,
  "company": "所属/会社名",
  "company_logo": 456
}
```

登壇者フィールドは ACF 非依存。プレイン PHP + メタボックスで実装し、  
データは JSON シリアライズしてポストメタに保存する。

---

## タクソノミー

| 名称 | スラッグ | 用途 |
|------|---------|------|
| セッショントラック | `next_event_track` | 会場・トラック単位の列管理。子ブロックで参照 |
| イベント日付 | `next_event_date` | 複数日イベントのグループ管理。親ブロックで参照 |

---

## ブロック階層構成

```
NExT Event Timetable（親ブロック）
└── NExT Event Track（子ブロック・繰り返し可）
    └── NExT Event Card（孫ブロック・繰り返し可）
```

---

## 各ブロックの役割と属性

### 親ブロック：`NExT Event Timetable`

**スラッグ** : `next-event-timetable/timetable`

**役割** : タイムテーブル全体のコンテナ・時間軸の管理

| 属性 | 型 | デフォルト | 内容 |
|------|----|-----------|------|
| `eventDate` | `string` | `""` | `next_event_date` タクソノミーのスラッグ |
| `timeStart` | `string` | `"09:00"` | 表示開始時刻（HH:MM） |
| `timeEnd` | `string` | `"18:00"` | 表示終了時刻（HH:MM） |
| `timeInterval` | `integer` | `60` | 時間軸の刻み（15 / 30 / 60 分） |

**レイアウト** : CSS Grid 固定（grid / list 切り替えなし）  
- 左端列に時間軸を表示  
- `grid-template-rows` は `timeStart`〜`timeEnd` を `timeInterval` で分割して自動生成  
- CSS カスタムプロパティ（`--net-row-count` など）で行数を JS から CSS に渡す

---

### 子ブロック：`NExT Event Track`

**スラッグ** : `next-event-timetable/track`

**役割** : 会場・トラック単位のカラム管理

| 属性 | 型 | デフォルト | 内容 |
|------|----|-----------|------|
| `trackName` | `string` | `""` | トラック名（`next_event_track` タクソノミーから選択） |
| `trackColor` | `string` | `"#000000"` | カラーラベル |
| `trackIcon` | `string` | `""` | アイコン URL（任意） |
| `capacity` | `integer` | `0` | 定員（任意、0 = 非表示） |

---

### 孫ブロック：`NExT Event Card`

**スラッグ** : `next-event-timetable/card`

**役割** : カスタムポストと紐づく個別セッションの表示

| 属性 | 型 | デフォルト | 内容 |
|------|----|-----------|------|
| `postId` | `integer` | `0` | 紐づく `next_event_session` の投稿 ID |
| `timeStart` | `string` | `""` | 開始時刻（ポスト選択時に自動取得） |
| `timeEnd` | `string` | `""` | 終了時刻（ポスト選択時に自動取得） |
| `sessionTitle` | `string` | `""` | タイトル（ポストから自動取得） |
| `speakerName` | `string` | `""` | 登壇者名（ポストから自動取得） |
| `speakerAvatar` | `string` | `""` | アバター画像 URL（ポストから自動取得） |
| `sessionType` | `string` | `"talk"` | 種別（ポストから自動取得） |
| `sessionTag` | `string` | `""` | タグ・カテゴリ |

**エディター操作**  
- Inspector サイドバーのドロップダウンで `next_event_session` 一覧を表示  
- ポスト選択後、`timeStart`/`timeEnd`/`sessionTitle`/`speakerName` を REST API 経由で自動入力

**グリッド配置**  
- `timeStart`/`timeEnd` と親ブロックの `timeStart`/`timeInterval` から `grid-row` 開始・終了行を計算してインラインスタイルに設定

---

## モーダル表示

- カードクリック → `?p={postId}&next_event_modal=1` を **iframe** で表示
- テーマ側で `single-next_event_session.php` を用意してモーダル用レイアウトを実装する前提
- モーダルの開閉はプレイン JS（依存ライブラリなし）で制御

---

## スタイリング方針

- **プレイン CSS**（Tailwind 等のフレームワーク不使用）
- CSS カスタムプロパティでテーマカラーや Grid パラメータを制御
- エディター・フロントエンドで同一スタイルシートを共有
- ブロック固有スタイルは BEM ライクなクラス命名（`.net-timetable`、`.net-track`、`.net-card` など）

---

## ブロック名（英語）一覧

| ブロック | 表示名 | スラッグ |
|---------|--------|---------|
| 親 | NExT Event Timetable | `next-event-timetable/timetable` |
| 子 | NExT Event Track | `next-event-timetable/track` |
| 孫 | NExT Event Card | `next-event-timetable/card` |
