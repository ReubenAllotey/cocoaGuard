# Cocoa backend

This folder holds the trained model artifacts under `backend/model/` and a tiny zero-dependency HTTP server for the app's `/analyze` endpoint.

Current state:
- The React Native app can POST the captured image payload to this endpoint.
- The backend uses a heuristic fallback right now because this workspace does not have TensorFlow/Keras installed.
- The copied `config.json`, `metadata.json`, and `model.weights.h5` are ready for a TensorFlow-serving implementation when the runtime is available.

Run the local fallback server:

```bash
node backend/server.mjs
```

Then set:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:5050
```

If you want the real Keras model executed here, the next step is to add a TensorFlow runtime plus the image preprocessing stack.
