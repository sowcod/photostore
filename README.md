# photostore
AWSで写真管理

## 今の運用
- 個人のHDDにMacの写真ライブラリを作って写真管理をしている
- コストの問題でiCloud課金はしていない
- iCloud無料枠の5GB到達前後で、半分くらいをライブラリに移動している
- この作業は3ヶ月に1回くらい。およそ1GB/月くらいとする。
- 写真移動のタイミングで目ぼしい写真を選んでiCloud共有ライブラリにも登録することで、HDDへの移動後も写真を確認できる。

## 悩み
- 移動作業にPCを使うので面倒
- 移動作業をサボるとiCloudが容量いっぱいで写真バックアップされなくなる
- HDDにも寿命がある。現時点で8年くらいは断続的に使用している。
- Macの写真アプリは気が利きすぎて挙動がわからないことがある。

## 希望
- 低価格で安全に写真をバックアップしたい
- 写真を簡単に見返したい
- 場所と期間の2軸で写真を探したい。
- 写真移動にできればPCを使いたくない

## ソリューション

### データ管理
- S3 Intelligent-Tieringで一旦2階層で持たせる
- 3層目は独自実装で適当なGlacierに移動させて適宜復元させる仕組みを持つ
- S3保存を起点にサムネイル作成とメタデータ保存など行う
- サムネイルはアーカイブさせない。オリジナルデータのみアーカイブさせる。
- 動画のサムネイルはGIF化。ffmpegが使えるかも。
- 場所情報はGeohashを活用してクエリできるようにする
- メタデータなどはDynamoDBを使用
- S3リクエスト数軽減のためCloudFrontを使用
- 画像のデータのキャッシュ時間はかなり長めにする

### 写真ブラウザ
- Web実装、SPAアプリ。
- モバイル対応
- 画像の遅延読み込み
- 無限スクロールに近いもの
- 年度ごとにアーカイブからまとめて復元させる機能（Glacier一括取り出しの機能か？）
- お気に入り機能
- アルバム機能
- 共有機能（期限付きURLで公開するみたいな？）
- S3+lambda+DynamoDBにより完全サーバーレスで実装する
- iCloudから自動的にアップロードする
- 知られたくない写真とかあるかもしれないので100%自動とはしない。

## セキュリティ
- CloudFrontは署名つきCookie機能を使って制限
- ログイン画面は必要

## マイルストーン
- フロントエンドのモックアップ
  - 画像とサムネイルとメタデータを大量に生成
  - 左カラムに年月、右カラムに画像の2カラムレイアウトの画像ビューアを作成
  - 削除機能
  - お気に入り機能
- バックエンド
  - AWS SAMでローカルlambdaとDynamoDBをたてる
  - DBにメタデータを入れる
  - DBから値を取得するAPIをlambdaで実装
  - 削除用API
  - フロントエンドと繋げる
- 静止画S3保存時処理
  - DynamoDBにメタデータを登録する
  - サムネイルを生成してS3に保存する
- デプロイ
  - AWS上で動作確認
- フロントエンドの動画対応
  - サムネイルのGIF対応
- 動画S3保存時処理
  - ffmpegのlambda用レイヤー
  - DynamoDBにメタデータを登録する
  - サムネイル、GIFを生成してS3に保存する
  - 新形式にすぐ対応できるようにデプロイ環境はしっかりしておく
- 認証機能
  - Cognitoセットアップ
  - Cloudfront署名つきCookieセットアップ
  - ログイン画面など実装
- アップロードツール
  - CLIでもいいので動画と画像をS3にアップロードするツールを作る
  - アップロード前にメタデータを検証する。アップロード後に問題が起きないように。

- 直近の実データを登録して試験運用開

- 料金節約
  - S3 Intelligent-Tieringセットアップ
- Glacier関係
  - お気に入りはGlacier行きにしない
  - アーカイブ化してGlacier行きか、ファイル単位でGlacier行きかどちらにするか。
  - 画面から復活指示すると時間経過後にオリジナルが復活する。月か年単位の指示。
  - 2年前または復活後30日後にGlacier行きにするバッチをlambdaで作る
  - 削除APIのGlacier考慮
- Webからのアップロード機能
  - 一眼の写真とかをWeb画面からD&Dで簡単にアップロードできる画面を作る。
  - アップロードしたものかどうかがわかるようにタグはつける

- 位置検索機能
  - 地図にマッピングする機能。地図の拡大率に応じて写真をクエリする。
- 自動アップロード
  - iCloudから写真を取得するAPIについて調査
  - 写真閲覧用アカウントとiCloudアカウントを紐づける管理機能
  - 自動アップロードするが非公開フラグを立てる。S3の非公開用ディレクトリか何かに移動する？
  - 個人アカウントごとに公開しない写真を選んでから確定する。

- 優先順位低い
  - 一括ダウンロード
  - アルバム機能
  - リンク共有機能
  - 利用料金モニタ
