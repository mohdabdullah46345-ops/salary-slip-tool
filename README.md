# 💸 Salary Slip Generator

A clean, professional **salary slip / payslip generator** that runs entirely in your browser.
Fill in the details, watch the live preview update instantly, and download a print‑ready PDF.
No sign‑up, no server, no data ever leaves your device.

## ✨ Features

- **Live preview** — the payslip updates as you type
- **Company branding** — upload your logo, add company name, address & contact
- **Full employee details** — ID, designation, department, DOJ, PAN, bank, UAN
- **Attendance** — total working days, loss‑of‑pay & auto paid‑days calculation
- **Custom earnings & deductions** — add/remove any number of rows
- **Auto calculations** — gross earnings, total deductions and **net pay**
- **Amount in words** — Indian numbering system (Lakh / Crore)
- **One‑click PDF** — uses the browser's print dialog for a crisp A4 output
- **Auto‑save** — your data is remembered in the browser via `localStorage`
- **100% offline & private** — pure HTML/CSS/JS, zero external dependencies

## 🚀 Live Demo

Once GitHub Pages is enabled (see below), the app will be available at:

```
https://<your-username>.github.io/<repository-name>/
```

## 🛠️ Run Locally

It is a static site — just open `index.html` in any browser. Or serve it:

```bash
# Python
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 📦 Deploy to GitHub Pages

This repo ships with an automatic deployment workflow (`.github/workflows/deploy.yml`).

1. Push the code to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Every push to `main` will publish the site automatically.

> Prefer the simple route? Under **Settings → Pages**, set **Source = Deploy from a branch**,
> pick `main` / `root`, and save. The included `.nojekyll` file ensures all assets are served as‑is.

## 📁 Project Structure

```
.
├── index.html              # Markup / layout
├── styles.css              # Styling + print stylesheet (clean PDF)
├── script.js               # Logic: preview, calculations, words, storage
├── .nojekyll               # Tell Pages to skip Jekyll processing
├── .github/workflows/      # Auto‑deploy to GitHub Pages
└── README.md
```

## 📝 License

Released under the [MIT License](LICENSE). Free to use and modify.
