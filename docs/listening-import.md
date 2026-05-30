# 听力素材导入说明

听力模块使用：

- R2：保存 `audio.mp3`、`subtitles.en.json`、`subtitles.bilingual.json` 等文件；
- D1：保存素材索引和个人播放进度；
- Worker：登录后代理音频流和字幕读取。

## 1. 准备 R2 bucket

`wrangler.jsonc` 里绑定名是：

```jsonc
{
  "binding": "LISTENING_BUCKET",
  "bucket_name": "ielts-listening-private"
}
```

如果 Cloudflare 里还没有这个 bucket，创建：

```bash
npx wrangler r2 bucket create ielts-listening-private
```

## 2. 应用 D1 migration

```bash
npx wrangler d1 migrations apply DB --remote
```

如果你的远程 D1 名称不是 `DB`，按实际名称替换。

## 3. 导入整理好的听力素材

把标准化素材目录放到项目外或项目内均可，目录需包含：

```txt
index.json
import.sql
每个 episode 的 audio.mp3 / subtitles.en.json / subtitles.bilingual.json
```

然后运行：

```bash
npm run import:listening -- --source=/path/to/standardized_listening_jan --bucket=ielts-listening-private --database=DB
```

先预览命令，不实际上传：

```bash
npm run import:listening -- --source=/path/to/standardized_listening_jan --dry-run
```

## 4. 当前第一批素材

已整理的 BBC 2024 年 1 月四期素材在本机：

```txt
/opt/data/cache/documents/standardized_listening_jan
```

也有压缩包：

```txt
/opt/data/cache/documents/standardized_listening_jan.zip
```

## 5. 注意

- R2 bucket 不要公开；音频通过 Worker 鉴权后读取。
- 音频接口支持 `Range`，拖动进度条会更稳定。
- 第一版同步字幕使用英文字幕；双语字幕先作为后续翻译/对照素材备用。
