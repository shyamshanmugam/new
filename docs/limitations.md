# Limitations and Safe Interpretation

- The live application uses a client-side rule engine; it does not run trained ML.
- Uploaded photos are validated and previewed. No soil-image classification is returned.
- The experimental image training script has not produced a verified model in this workspace.
- Nine unique exact image contents cross the supplied train/test boundary. Metrics on the current test directory would be leakage-prone.
- Image source and redistribution license are not documented.
- No structured soil-test measurement dataset or supervised target labels were found.
- Crop compatibility and soil score are unvalidated prototype rules; crop, season, soil texture, local laboratory method, and region affect interpretation.
- Advice is general and does not provide universal fertilizer or amendment rates.
- History stays in the current browser; it is not a cloud database and old legacy entries cannot reopen complete results if they lack saved input/result data.
- A PostgreSQL schema proposal exists, but no database server has been configured or connected.
- Physical Android camera, install prompt, voice availability, and offline behavior have not been verified on a device.
- Visual browser checks are not a substitute for assistive-technology, field-user, or formal WCAG accessibility testing.

Do not use the prototype instead of a laboratory soil report or local agricultural-extension advice.
