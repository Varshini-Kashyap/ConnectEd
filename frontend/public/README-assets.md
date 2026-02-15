# Static assets

Place **`illustration.png`** here for the login/signup background.

- **Path:** `ConnectEd/frontend/public/illustration.png`
- **Usage:** The auth layout uses it as the full-page background image (with a light overlay so the form stays readable).
- In Vite, files in `public/` are served at the site root, so the image is loaded as `/illustration.png`.

If you have the illustration in the warm-theme mockups folder, you can copy it:

```bash
cp "/Users/jayanth/Documents/MS Docs/GMU-Hackathon/warm-theme/illustration.png" "/Users/jayanth/Documents/MS Docs/GMU-Hackathon/ConnectEd/frontend/public/illustration.png"
```

If the file is missing, the page still works and shows the warm gradient as the background.
