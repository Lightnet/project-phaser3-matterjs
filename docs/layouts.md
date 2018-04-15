# Layouts:

```
 - assets
 - main.js <- Main entry setup for express. Server does game and server engine start up.
 - src
  - client
   - clientEntryPoint.js <- Browser client setup main entry.
   - MyRenderer.js <- Phaser 3 framework draw.
   - Files here deal with render object handler.
  - common
   - MyGameEngine.js <- Default game setup.
   - Files here share client and server scripts.
  - server
   - MyServerEngine.js <- Handle user connections and setup game.
```