# Standing wave asset

`character-waving.svg` is a self-contained animated SVG with embedded raster artwork. It can be used directly in an `<img>` element. It loops every 3.6 seconds and respects reduced-motion preferences. Preview it at `/character-preview.html`.

Artwork: built-in image-generation tool. Animation: an SVG/CSS forearm rotation around the elbow, with a short rest between waves. The existing homepage and About animations are unchanged.

## Final artwork prompt

Use case: identity-preserve. Create an animation-ready TWO-LAYER SPRITE ATLAS from the supplied standing waving character. Output ONE wide image with exactly TWO equal portrait panels side by side, each with identical coordinate system and scale. Transparent background, REAL CLEAN ALPHA, remove ALL halos/glow/shadows around the character. No lines separating panels, no text or labels. LEFT PANEL: the exact full-body standing character with same black hair, round black glasses, smiling face, orange hoodie, charcoal pants, white sneakers, unchanged pose and scale, EXCEPT erase the raised waving hand and raised forearm from the elbow upward, leaving the rounded orange elbow/upper-arm stump at viewer-left. Keep the elbow/upper arm connected to torso. RIGHT PANEL: show ONLY the detached raised forearm, orange sleeve/cuff and open waving hand, at exactly the same scale and exact same relative coordinates within its panel as they occupy within the character's left panel; everything else transparent. Include a rounded orange sleeve extension at the forearm's lower end to overlap the elbow and conceal the animation joint. Both panels' coordinate origins and scale must match perfectly so overlaying right onto left reconstructs original character. Character fills 88 percent of each panel height with comfortable margins. This is a production 2D cutout animation rig: one stationary body sprite and one rotating waving forearm sprite. Preserve identity and 3D rendering style exactly. No background, no glow, no duplicate whole character in right panel.

## Revision 2: blink and sleeve

The forearm now has a rounded elbow end without the extra cuff. A short blink runs every 4.8 seconds; both animations stop under reduced-motion preferences. Rebuild with `python3 scripts/build-wave.py`.

Both updated raster layers were edited with the built-in image-generation tool. The SVG uses the repaired sleeve atlas and masked closed-eye patches; the glasses and rest of the face remain stationary.

### Sleeve edit prompt

Edit this existing 1536x1024 transparent animation sprite atlas. PRESERVE exact canvas dimensions and every element's location, scale, character identity, face, clothes and pose. Change ONLY the detached waving forearm sprite at upper right: remove the extra orange cuff-like protrusion on its BOTTOM (the elbow end). The only ribbed cuff should remain directly beneath the HAND. Make the lower elbow end a single smooth rounded orange sleeve cap, matching the sleeve's material, with no second cuff, no ring, no seam, no dangling flap. Its rounded lower end should extend down to the former bottom of the extra cuff, so the total sprite bounds stay the same. Keep the body sprite on the left unchanged. True transparent alpha background, preserve transparency. No text, no extra elements.

### Blink edit prompt

Edit this exact 1536x1024 transparent animation sprite atlas for a blink animation. Change ONLY the character's two open eyes into naturally CLOSED eyes, represented by subtle gently curved dark upper eyelid lines, like a brief relaxed blink. Preserve exact canvas size, exact pixel positioning, same head size and position, glasses outline and lenses, skin color and shading, eyebrows, hair, smile, body and detached forearm. Eyes CLOSED, no black oval eyeballs visible. Do not change expression to laughing or squinting. Keep all other pixels as close as possible to the original. True transparent background with alpha preserved.
