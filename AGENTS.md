# Project conventions

- Use the locally installed Microsoft Edge for browser verification, with an isolated temporary profile. Do not use Tabbit or its CLI for this project.
- Run `npm run verify:edge` for the theme's browser checks. Do not attach to the user's normal browser profile or change the system default browser.
- Edit SCSS sources and rebuild `theme.css` with `npm run build`. Preserve existing unrelated changes.
- Hotkeys are separate from theme CSS. Changes to a user's vault must use the documented backup and merge workflow.
