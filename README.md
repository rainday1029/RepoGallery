<p align="center">
   <img width="100%" src="assets/RepoGallery-banner-dark.png" alt="RepoGallery Logo" />
   <h1 align="center">RepoGallery</h1>
   <h3 align="center">Just fork &amp; good to go!</h3>
   <p align="center">A beautiful showcase for all your GitHub repos. :art:</p>
</p>

<p align="center"> <a href="https://anlit75.github.io/RepoGallery">View Live Demo</a></p>

## :rocket: Quick Start

### Step 1. **Fork This Repository**

Click the **Fork** button to create your own copy of this repository.

> [!TIP]\
> We recommend keeping the original repository name (`RepoGallery`).

### Step 2. **GitHub Settings**

> [!IMPORTANT]\
> These settings can only be configured on GitHub Web/Desktop.

Make sure your repository is set up with the following configurations:

- **Settings > Actions > General**
  - :white_check_mark: **Actions permissions**: Allow all actions and reusable workflows
  - :white_check_mark: **Workflow permissions**: Read and write permissions
- **Settings > Pages**
  - :white_check_mark: **Build and deployment** source: **GitHub Actions**

### Step 3. **Personalization (Optional)**

:art: Customize your showcase page by editing the `config.yaml` file (e.g., site title, theme, etc.).

### Step 4. **Manual GitHub Action Trigger (Optional)**

If you'd like to see your page immediately:

- Navigate to the **Actions** tab, select the **RepoGallery** workflow from the left sidebar
- Click the **Run workflow** button

> [!NOTE]\
> You can wait for the scheduled run (default is at 00:00 UTC :clock12: every day).

### Step 5. **View Your Awesome RepoGallery Page**

- Once GitHub Pages is deployed (this may take a few minutes), your page will be available at: <br>
  `https://<your-github-username>.github.io/RepoGallery`

> [!TIP]\
> You can also find the URL by clicking **Use your GitHub Pages website** in your repository's **About** settings.

## How to Sync with Upstream

If you've wanted to keep your forked repository up-to-date with the upstream, you can follow these steps:

### You DID NOT make any changes to the `config.yaml` or don't mind losing them

1. Go to your forked repository
2. Click the **Sync fork** button
3. Click **Discard n commits**
4. That's it!

> [!WARNING]\
> If you want to keep your changes, **DO NOT** click the **Discard n commits** button!
> This will reset your forked repository to the state of the upstream repository.

### You DID make changes to the `config.yaml` and want to keep them

1. Use the following commands in your terminal:

   ```bash
   #!/bin/bash
   chmod +x sync.sh
   ./sync.sh
   ```

2. That's it!

## 🛠 How It Works (For the Curious)

- GitHub Action (`repo_gallery.yaml`) will automatically runs `generate_html.py`, which reads `config.yaml` and the `templates/` to generate the latest `index.html` and update your GitHub Pages.
- For more details on the implementation, please check out:
  - The `script/` folder
  - The contents of the `templates/` folder

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).
