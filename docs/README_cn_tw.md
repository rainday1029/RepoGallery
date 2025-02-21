<p align="center">
   <img width="100%" src="../assets/doc_img/RepoGallery-banner-dark.png" alt="RepoGallery Logo" />
   <h1 align="center">RepoGallery</h1>
   <h3 align="center">Just fork &amp; good to go!</h3>
   <p align="center">A beautiful showcase for all your GitHub repos. :art:</p>
</p>

<br>

<p align="center">
  <a href="https://anlit75.github.io/RepoGallery">觀看線上展示</a>  |  <a href="https://anson-cheng.github.io/RepoGallery-demo-dark">更多範例</a>
</p>

<br>

<p align="center">
  <a href="README.md">English</a>  |  <a href="docs/README_cn_tw.md">繁體中文</a>
</p>

<br>

<h2 align="center">✨ 主要優勢 ✨</h2>

<p align="center">
  🔹 簡易設定 • ⚡ 自動化部署 <br>
  🎨 可自訂風格 • 💎 現代化設計 <br>
  🔄 輕鬆更新 • 🚀 提供線上 Demo
</p>

<br>

## :gear: 先決條件

在開始之前，請先確保你擁有一個 **GitHub 帳號**。

## :rocket: 快速開始

### 第 1 步：**Fork 此專案**

點擊本頁右上方的 **Fork** <img src="../assets/doc_img/fork.png" style="height: 20px !important;width: 20px !important;" > 按鈕，建立你自己的倉庫副本。

> [!TIP]\
> 建議將此專案名稱保持為 `RepoGallery`。

### 第 2 步：**GitHub 設定**

> [!IMPORTANT]\
> 這些設定**必須**在 GitHub 網站上進行（GitHub 手機板不支援這些設定）。

請確認你的倉庫設定如下：

#### **A. 設定 GitHub Pages**
<details>
<summary>前往 <strong>Settings > Pages</strong></summary>
   <img width="100%" style="padding: 10px;" src="../assets/doc_img/pages.png" alt=""/>
</details>

<details>
<summary>✅ 設定 <code>Build and deployment</code> 的 <strong>Source</strong> 為 <strong>GitHub Actions</strong></summary>
   <img width="100%" style="padding: 10px;" src="../assets/doc_img/build_and_deployment.png" alt=""/>
</details>

#### **B. 啟用 GitHub Actions**
<details>
<summary>前往 <strong>Settings > Actions > General</strong></summary>
   <img width="100%" style="padding: 10px;" src="../assets/doc_img/actions_general.png" alt=""/>
</details>

<details>
<summary>✅ 將 <code>Action permissions</code> 設為 <strong>Allow all actions and reusable workflows</strong></summary>
   <img width="100%" style="padding: 10px;" src="../assets/doc_img/actions_permissions.png" alt=""/>
</details>

#### **C. 啟用 Workflows**
前往 **Actions** <img src="../assets/doc_img/actions.png" style="height: 20px !important;width: 20px !important;" > 分頁
 1. 你會看到默認情況下 **Workflows** 處於停用狀態
      <details>
      <summary>點擊 <strong>I understand my workflows, go ahead and enable them</strong></summary>
         <p align="left"><img width="100%" style="padding: 10px;" src="../assets/doc_img/workflows_enable.png" alt=""/></p>
      </details>
 2. 從左側選單中選擇 **RepoGallery** workflow
 3. 你會看到警告 **Scheduled workflows are disabled by default in forks**
      <details>
      <summary>點擊 <strong>Enable workflow</strong> 按鈕</summary>
         <p align="left"><img width="100%" style="padding: 10px;" src="../assets/doc_img/repogallery_action_enable.png" alt=""/></p>
      </details>

### 第 3 步：**手動觸發 GitHub Action（可選但建議）**

> [!TIP]\
> 如果你想自訂你的展示頁，可以**略過此步驟，直接進行第 4 步**。

為了確保 GitHub Actions 運作正常，可手動觸發 workflow：

1. 前往 **Actions** <img src="../assets/doc_img/actions.png" style="height: 20px !important;width: 20px !important;" > 分頁
2. 從左側選單中選擇 **RepoGallery** workflow
3. 點擊 **Run workflow** 按鈕

> [!NOTE]\
> workflow 也會在每天 UTC 00:00 自動執行 🕛。\
> **對 `main` 分支的任何 `push` 也會觸發 workflow**。

### 第 4 步：**個人化設定（可選）**

:art: 你可以透過編輯 `config.yaml` 來自訂展示，包括：
- 更改網站標題
- 調整佈景主題顏色
- 以及更多選項！

編輯完成後，**commit 並 push** 你的變更。

> [!TIP]\
> 若你**沒有**手動觸發第 3 步，此次 `push` **將會觸發 workflow 並自動部署你的展示頁面**。\
> 想了解更多使用方式，請參考 [**config.yaml**](config.yaml)。

### 第 5 步：**查看你的 RepoGallery 頁面**

當 GitHub Actions 執行成功並且 GitHub Pages 部署完成後（可能需要幾分鐘），你的展示頁將可以在以下網址使用：

📌 `https://<your-github-username>.github.io/RepoGallery`

> [!TIP]\
> 你也可以在倉庫的 **About** 設定中，點擊 **Use your GitHub Pages website** 找到此 URL。

## 🔄 如何保持更新

如果你想與 RepoGallery 專案保持同步，請依照下列步驟：

### **A. 如果你沒修改 config.yaml 或不介意丟失變更**
1. 前往你 Fork 的倉庫
2. 點擊 **Sync Fork** <br>
   <img src="../assets/doc_img/sync_fork.png" style="padding: 10px; width: 30%;" >
3. 點擊 **Discard n commits** <br>
   <img src="../assets/doc_img/discard_commits.png" style="padding: 10px; width: 50%;" >
4. 完成！

> [!WARNING]\
> 如果你想保留自己的變更，**不要**點擊 **Discard n commits**。\
> 這會將你的 Fork 重置為與原專案相同狀態。

### **B. 如果你已修改 config.yaml 並希望保留變更**
在終端機執行以下命令：
```bash
#!/bin/bash
cd RepoGallery
chmod +x sync.sh
./sync.sh
```

## 🛠 運作方式（給好奇的你）

當 GitHub Actions（`repo_gallery.yaml`）執行時，它會自動執行 `generate_html.py`，並且：

1. 讀取 `config.yaml`
2. 使用 `templates/` 資料夾中的模板生成新的 html 檔案

接著 GitHub Actions 會將最新內容部署到 GitHub Pages。

### 想了解更多？
歡迎查看：
- `script/` 資料夾內的腳本
- `templates/` 資料夾內的模板

## ☕ 請我喝杯咖啡
如果你喜歡這個專案，希望我能持續改進，可以請我喝杯咖啡！ <br>
在 Buy Me a Coffee 支持我的工作 :sparkling_heart:

<a href="https://www.buymeacoffee.com/anlit" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 150px !important;" ></a>

## 📄 授權

此專案採用 [Apache License 2.0](LICENSE) 授權。
